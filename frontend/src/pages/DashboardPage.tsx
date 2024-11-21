import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  interface Expense {
    _id: string;
    description: string;
    amount: number;
    saving: number;
    date: Date;
  }

  interface UserData {
    username: string;
    email: string;
    expenses: Expense[];
  }

  const [userData, setUserData] = useState<UserData | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [expensesForMonth, setExpensesForMonth] = useState<Expense[]>([]);
  const navigate = useNavigate();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const username = localStorage.getItem('username');

      if (!username) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/users/user/${username}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const fetchExpensesForMonth = async (monthIndex: number) => {
    const username = localStorage.getItem('username');
    if (!username || selectedMonth === null) return;
  
    try {
      const response = await fetch(`http://localhost:5000/api/users/user/${username}/expenses/${year}/${monthIndex + 1}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      const data = await response.json();
      setExpensesForMonth(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(parseInt(event.target.value));
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleLogExpense = async () => {
    if (!description || amount === null || saving === null || selectedMonth === null) return;
  
    const username = localStorage.getItem('username');
    if (!username) return;
  
    const date = new Date(year, selectedMonth, 1);
  
    try {
      const response = await fetch(`http://localhost:5000/api/users/user/${username}/expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount, saving, date }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to log expense');
      }
  
      const data = await response.json();
      setExpensesForMonth((prevExpenses) => [
        ...prevExpenses,
        { _id: data._id, description, amount, saving, date },
      ]);
  
      // After logging the expense, refetch expenses for the selected month only
      fetchExpensesForMonth(selectedMonth);
      
      // Reset form fields
      setDescription('');
      setAmount(null);
      setSaving(null);
    } catch (error) {
      console.error('Error logging expense:', error);
    }
  };

  const handleMonthClick = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    fetchExpensesForMonth(monthIndex);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const username = localStorage.getItem('username');
    if (!username) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/user/${username}/expense/${expenseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      setExpensesForMonth((prevExpenses) => prevExpenses.filter((expense) => expense._id !== expenseId));
      if (selectedMonth !== null) {
        fetchExpensesForMonth(selectedMonth); // Re-fetch expenses to update the total spent and saved
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEditExpense = async (expenseId: string) => {
    const expenseToEdit = expensesForMonth.find(expense => expense._id === expenseId);
    if (!expenseToEdit) return;
  
    // Set form fields to the current expense's values
    setDescription(expenseToEdit.description);
    setAmount(expenseToEdit.amount);
    setSaving(expenseToEdit.saving);
  
    // Optionally, delete the old expense from the server (depending on your app's flow)
    try {
      await handleDeleteExpense(expenseId);
    } catch (error) {
      console.error('Error during expense edit:', error);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="flex font-poppins items-center justify-center dark:bg-gray-900 min-w-screen min-h-screen w-screen">
      <div className="grid gap-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-[26px] m-4">
          <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-10 2xl:p-10 lg:p-10 md:p-10 sm:p-2 m-2">
            <h1 className="pt-8 pb-6 font-bold text-5xl dark:text-gray-400 text-center cursor-default">
              Welcome, {userData ? userData.username : 'Guest'}!
            </h1>
            <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded-md w-full mt-6">
              Logout
            </button>

            {/* Year Selector */}
            <div className="mt-8 mb-4">
              <label htmlFor="year" className="block text-lg font-medium text-gray-700">Select Year:</label>
              <select
                id="year"
                value={year}
                onChange={handleYearChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {yearOptions.map((yearOption) => (
                  <option key={yearOption} value={yearOption}>{yearOption}</option>
                ))}
              </select>
            </div>

            {/* Monthly Expense Overview */}
            <div className="grid grid-cols-3 gap-4">
              {months.map((month, index) => {
                const monthExpenses = userData ? userData.expenses.filter(expense => new Date(expense.date).getMonth() === index && new Date(expense.date).getFullYear() === year) : [];
                const totalSpent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
                const totalSaved = monthExpenses.reduce((sum, expense) => sum + expense.saving, 0);

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center h-24 bg-gray-100 border border-gray-300 rounded-lg shadow-sm cursor-pointer"
                    onClick={() => handleMonthClick(index)}
                  >
                    <div>{month}</div>
                    <div>Spent: ${totalSpent}</div>
                    <div>Saved: ${totalSaved}</div>
                  </div>
                );
              })}
            </div>

            {/* Log Expense Section */}
            {selectedMonth !== null && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">Log Expense for {months[selectedMonth]}</h2>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-lg font-medium text-gray-700">Description:</label>
                  <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-base border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="amount" className="block text-lg font-medium text-gray-700">Amount Spent:</label>
                  <input
                    type="number"
                    id="amount"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 text-base border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="saving" className="block text-lg font-medium text-gray-700">Amount Saved:</label>
                  <input
                    type="number"
                    id="saving"
                    value={saving || ''}
                    onChange={(e) => setSaving(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 text-base border-gray-300 rounded-md"
                  />
                </div>
                <button onClick={handleLogExpense} className="bg-green-500 text-white py-2 px-4 rounded-md">
                  Log Expense
                </button>
              </div>
            )}

            {/* Expenses List for Selected Month */}
            {selectedMonth !== null && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">Expenses for {months[selectedMonth]}</h2>
                <ul className="space-y-4">
                  {expensesForMonth.map((expense) => (
                    <li key={expense._id} className="flex items-center justify-between">
                      <div>
                        <div>{expense.description}</div>
                        <div>Spent: ${expense.amount}</div>
                        <div>Saved: ${expense.saving}</div>
                      </div>
                      <div className="flex space-x-4">
                        <button onClick={() => handleEditExpense(expense._id)} className="bg-blue-500 text-white py-1 px-2 rounded-md">Edit</button>
                        <button onClick={() => handleDeleteExpense(expense._id)} className="bg-red-500 text-white py-1 px-2 rounded-md">Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
