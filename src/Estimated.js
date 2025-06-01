
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table,Input, Space, message } from 'antd';
import './transaction.css'
const Transactions = () => {
     const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
   const [searchText, setSearchText] = useState('');


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
     const fecthdata= async()=>{
 try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/budget/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      });

      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      message.error('Failed to fetch transactions');
    }
  
     }

    const columns = [
  { title: 'Year', dataIndex: 'year', key: 'year',align: "center", },
  {
    title: 'Month',
    dataIndex: 'month',
    key: 'month',
    align: "center",
    render: (monthNumber) => {
      const monthObj = months.find(m => m.value === monthNumber);
      return monthObj ? monthObj.label : monthNumber;
    }
  },
  { title: 'Income', dataIndex: 'income', key: 'income' ,align: "center",},
  { title: 'Expense', dataIndex: 'expense', key: 'expense' ,align: "center",}
];

  useEffect(() => {
    fecthdata();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = data.filter(data =>
      data.category_name.toLowerCase().includes(value.toLowerCase()) ||
      data.type.toLowerCase().includes(value.toLowerCase()) ||
      data.amount.toString().includes(value)
    );
    setFilteredData(filtered);
  };

    return(

      <div>
         <h2>Estimated</h2>
              <Space style={{ marginBottom: 16 }}>
                <Input.Search
                  placeholder="Search by category, type or amount"
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: 300 }}
                />
              </Space>
          <Table
          className="custom-table"
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />



      </div>
    )
}

export default Transactions;
