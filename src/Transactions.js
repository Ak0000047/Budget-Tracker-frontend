import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, Select, Space, message } from 'antd';
import dayjs from 'dayjs';
import './transaction.css';
const { Option } = Select;

const Transactions = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/transactions/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      });
      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      message.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = data.filter(
      (tx) =>
        tx.category_name.toLowerCase().includes(value.toLowerCase()) ||
        tx.type.toLowerCase().includes(value.toLowerCase()) ||
        tx.amount.toString().includes(value)
    );
    setFilteredData(filtered);
  };

  const openModal = (record = null) => {
    setEditRecord(record);
    form.setFieldsValue(record || { category_name: '', type: 'expense', amount: '' });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/transactions/${id}/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      });
      message.success('Deleted successfully');
      fetchTransactions();
    } catch (error) {
      message.error('Failed to delete transaction');
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      const url = editRecord
        ? `${API_URL}/transactions/${editRecord.id}/`
        : `${API_URL}/transactions/`;
      const method = editRecord ? 'put' : 'post';

      await axios[method](url, values, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      });

      message.success(editRecord ? 'Updated successfully' : 'Created successfully');
      setModalVisible(false);
      setEditRecord(null);
      form.resetFields();
      fetchTransactions();
    } catch (error) {
      message.error(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditRecord(null);
    form.resetFields();
  };

  const columns = [
    { title: 'Category', dataIndex: 'category_name', key: 'category_name', align: 'center' },
    { title: 'Type', dataIndex: 'type', key: 'type', align: 'center' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'center' },
    {
      title: 'Date & Time',
      dataIndex: 'datetime',
      key: 'datetime',
      align: 'center',
      render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)} aria-label={`Edit transaction ${record.category_name}`}>
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.id)}
            aria-label={`Delete transaction ${record.category_name}`}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Transactions</h2>

      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by category, type or amount"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          allowClear
          loading={loading}
          aria-label="Search transactions"
        />
        <Button type="primary" onClick={() => openModal()} aria-label="Add transaction">
          Add Transaction
        </Button>
      </Space>

      <Table
        className="custom-table"
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        loading={loading}
      />

      <Modal
        title={editRecord ? 'Edit Transaction' : 'Add Transaction'}
        open={modalVisible}
        onOk={handleModalSubmit}
        confirmLoading={modalLoading}
        onCancel={handleModalCancel}
        okText="Save"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="category_name"
            label="Category"
            rules={[{ required: true, message: 'Please enter category' }]}
          >
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Option value="expense">Expense</Option>
              <Option value="income">Income</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <Input type="number" min={0} step="0.01" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Transactions;
