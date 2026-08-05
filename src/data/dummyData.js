export const metrics = [
  { label: 'Total Balance', value: 48250, change: '+12%', up: true },
  { label: "This Month's Spending", value: 14800, change: '+8%', up: false },
  { label: 'Total Income', value: 32000, change: '+5%', up: true },
  { label: 'Budget Remaining', value: 5200, change: '68% used', up: true },
]

export const budgetUsedPercent = 68

export const transactions = [
  { id: 1, name: 'Swiggy', category: 'Food', amount: -450, date: 'Today, 2:30 PM' },
  { id: 2, name: 'Salary Credit', category: 'Income', amount: 32000, date: 'Yesterday' },
  { id: 3, name: 'Uber', category: 'Transport', amount: -180, date: 'Yesterday' },
  { id: 4, name: 'Amazon', category: 'Shopping', amount: -1200, date: '2 days ago' },
  { id: 5, name: 'Electricity Bill', category: 'Utilities', amount: -890, date: '3 days ago' },
  { id: 6, name: 'Zomato', category: 'Food', amount: -320, date: '3 days ago' },
  { id: 7, name: 'Netflix', category: 'Entertainment', amount: -499, date: '4 days ago' },
  { id: 8, name: 'Petrol', category: 'Transport', amount: -1500, date: '5 days ago' },
  { id: 9, name: 'Gym Membership', category: 'Health', amount: -1800, date: '6 days ago' },
  { id: 10, name: 'Freelance Payment', category: 'Income', amount: 8000, date: '1 week ago' },
]

export const monthlySpending = [
  { day: '1', amount: 200 },
  { day: '4', amount: 450 },
  { day: '7', amount: 300 },
  { day: '10', amount: 800 },
  { day: '13', amount: 600 },
  { day: '16', amount: 950 },
  { day: '19', amount: 400 },
  { day: '22', amount: 1100 },
  { day: '25', amount: 700 },
  { day: '28', amount: 1300 },
]

export const categoryBreakdown = [
  { category: 'Food', amount: 4200, color: '#c9a35e' },
  { category: 'Transport', amount: 2800, color: '#4a8a6d' },
  { category: 'Shopping', amount: 3600, color: '#b3552f' },
  { category: 'Utilities', amount: 1900, color: '#e3c98a' },
  { category: 'Entertainment', amount: 1200, color: '#7d9c8a' },
  { category: 'Health', amount: 1800, color: '#a8695f' },
]
export const sixMonthTrend = [
  { month: 'Mar', income: 28000, expense: 19500 },
  { month: 'Apr', income: 30000, expense: 21000 },
  { month: 'May', income: 29500, expense: 17800 },
  { month: 'Jun', income: 32000, expense: 20500 },
  { month: 'Jul', income: 31000, expense: 15200 },
  { month: 'Aug', income: 32000, expense: 14800 },
]

// 5 weeks × 7 days, Mon–Sun, ₹0 = no spend that day
export const dailyHeatmap = [
  120, 0, 340, 80, 0, 560, 0,
  200, 450, 0, 90, 700, 0, 150,
  0, 380, 220, 0, 900, 100, 0,
  310, 0, 150, 480, 0, 0, 620,
  90, 260, 0, 540, 130, 0, 0,
]