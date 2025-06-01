import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Select,
  Button,
  Card,
  Typography,
  message,
  Row,
  Col,
  Statistic,
  Spin,
} from 'antd';

const { Title } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const [year, setYear] = useState();
  const [month, setMonth] = useState();
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const fetchSummary = async (Year, Month) => {
    if (!Year || !Month) {
      message.error('Please select a year and month');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/summary/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
        params: { year: Year, month: Month },
      });

      const { income, expense } = response.data;
      const estimated_data = parseFloat(income);
      const actual_data = parseFloat(expense);

      setSummary({ estimated_data, actual_data });

      if (actual_data > estimated_data) setStatus('Over Budget');
      else if (actual_data < estimated_data) setStatus('Remaining Balance');
      else setStatus('On Budget');
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch summary');
      setSummary(null);
      setStatus('Error Fetching Data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    setYear(currentYear);
    setMonth(currentMonth);
    fetchSummary(currentYear, currentMonth);
    fetchAvailableYears();
  }, []);

  const fetchAvailableYears = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/available-years/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      });
      setAvailableYears(response.data);
    } catch (error) {
      console.error('Failed to fetch available years:', error);
    }
  };

  const fetchAvailableMonths = async () => {
    if (!year) return;
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/available-months/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
        params: { year },
      });
      const monthsFromAPI = response.data;
      const filteredMonths = months.filter((month) => monthsFromAPI.includes(month.value));
      setAvailableMonths(filteredMonths);
    } catch (error) {
      console.error('Failed to fetch available months:', error);
    }
  };

  useEffect(() => {
    fetchAvailableMonths();
  }, [year]);

  useEffect(() => {
    if (summary) {
      const svg = d3.select('#chart')
        .attr('width', 400)
        .attr('height', 300);

      svg.selectAll('*').remove();

      const data = [
        { label: 'Estimated', value: summary.estimated_data },
        { label: 'Actual', value: summary.actual_data },
      ];

      const width = 400;
      const height = 300;
      const barWidth = width / data.length;

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .range([height, 0]);

      svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d, i) => i * barWidth)
        .attr('y', (d) => y(d.value))
        .attr('width', barWidth - 20)
        .attr('height', (d) => height - y(d.value))
        .attr('fill', (d, i) => (i === 0 ? 'green' : 'orange'));

      svg.selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .text((d) => `${d.label}: ${d.value}`)
        .attr('x', (d, i) => i * barWidth + 5)
        .attr('y', (d) => y(d.value) - 10);
    }
  }, [summary]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginTop: '20px' }}>
        <Row gutter={16} style={{ marginBottom: 14 }}>
          <Col span={12}>
            <Card hoverable onClick={() => navigate('/transactions')} style={{ backgroundColor: '#0090ad', cursor: 'pointer' }}>
              <Title level={4} style={{ color: '#fff' }}>Transactions</Title>
            </Card>
          </Col>
          <Col span={12}>
            <Card hoverable onClick={() => navigate('/estimated')} style={{ backgroundColor: '#0090ad', cursor: 'pointer' }}>
              <Title level={4} style={{ color: '#fff' }}>Budget Overview</Title>
            </Card>
          </Col>
        </Row>
      </div>

      <Card title="Summary Chart">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Select
              allowClear
              placeholder="Select Year"
              value={year}
              onChange={(value) => setYear(value)}
              style={{ width: 120 }}
            >
              {availableYears.map((yr) => (
                <Option key={yr} value={yr}>
                  {yr}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              allowClear
              placeholder="Select Month"
              value={month}
              onChange={(value) => setMonth(value)}
              style={{ width: 120 }}
              disabled={!availableMonths.length}
            >
              {availableMonths.map(({ value, label }) => (
                <Option key={value} value={value}>
                  {label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Button type="primary" onClick={() => fetchSummary(year, month)} loading={loading}>
              Show
            </Button>
          </Col>
        </Row>

        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          {status}
        </Typography.Text>
        <svg id="chart" className="w-full h-64"></svg>

        {summary && (
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Income"
                  value={summary.estimated_data}
                  precision={2}
                  prefix="₹"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Expense"
                  value={summary.actual_data}
                  precision={2}
                  prefix="₹"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title={
                    summary.actual_data > summary.estimated_data
                      ? 'Debt'
                      : summary.actual_data < summary.estimated_data
                      ? 'Balance'
                      : 'No Difference'
                  }
                  value={Math.abs(summary.actual_data - summary.estimated_data)}
                  precision={2}
                  prefix="₹"
                  valueStyle={{
                    color:
                      summary.actual_data > summary.estimated_data
                        ? 'red'
                        : summary.actual_data < summary.estimated_data
                        ? 'green'
                        : 'gray',
                  }}
                />
              </Card>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
