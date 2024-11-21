import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  interface UserData {
    username: string;
    email: string;
    // Add other user-specific fields here
  }

  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const username = localStorage.getItem('username'); // Assuming username is stored in local storage

      if (!username) {
        navigate('/login'); // Redirect to login if username is not found
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/users/user/${username}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        console.log('Fetched user data:', data); // Log the fetched data for debugging
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold">Welcome, {userData.username}!</h1>
      <p>Email: {userData.email}</p>
      {/* Display more user-specific data here */}
      <button onClick={handleLogout} className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;