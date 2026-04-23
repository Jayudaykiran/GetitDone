import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const details = await userAPI.getUserById(user.id);
        setUserDetails(details);
      } catch (error) {
        toast.error('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserDetails();
    }
  }, [user?.id]);

  const renderCustomerDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Current Bookings</h3>
              <p className="text-2xl font-bold text-blue-600">3</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Completed</h3>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">⭐</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Rating</h3>
              <p className="text-2xl font-bold text-yellow-600">4.8</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">House Cleaning Service</p>
              <p className="text-sm text-gray-500">Scheduled for tomorrow</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Pending</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Plumbing Repair</p>
              <p className="text-sm text-gray-500">Completed yesterday</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProviderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Earnings</h3>
              <p className="text-2xl font-bold text-blue-600">$2,450</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Completed Jobs</h3>
              <p className="text-2xl font-bold text-green-600">28</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">⭐</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Rating</h3>
              <p className="text-2xl font-bold text-yellow-600">4.9</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Active Listings</h3>
              <p className="text-2xl font-bold text-purple-600">5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">House Cleaning Request</p>
                <p className="text-sm text-gray-500">From John Doe</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Plumbing Service</p>
                <p className="text-sm text-gray-500">From Jane Smith</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Accepted</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Service Listings</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">Professional House Cleaning</p>
              <p className="text-sm text-gray-500">$50/hour • 4.9 rating</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">Plumbing Services</p>
              <p className="text-sm text-gray-500">$75/hour • 4.8 rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600">1,234</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Active Services</h3>
              <p className="text-2xl font-bold text-green-600">456</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Bookings</h3>
              <p className="text-2xl font-bold text-yellow-600">2,890</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
              <p className="text-2xl font-bold text-purple-600">$45,670</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">User Distribution</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customers</span>
                <span className="text-sm font-medium">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Service Providers</span>
                <span className="text-sm font-medium">30%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Admins</span>
                <span className="text-sm font-medium">5%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Recent Activity</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• New user registration: John Doe</p>
              <p>• Service booking completed: House Cleaning</p>
              <p>• Payment processed: $150</p>
              <p>• New service provider joined</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getUserRole = () => {
    return userDetails?.role || user?.role || 'CUSTOMER';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userDetails?.fullName || user?.fullName || 'User'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your {getUserRole().toLowerCase()} account today.
        </p>
      </div>

      {getUserRole() === 'CUSTOMER' && renderCustomerDashboard()}
      {getUserRole() === 'PROVIDER' && renderProviderDashboard()}
      {getUserRole() === 'ADMIN' && renderAdminDashboard()}
    </div>
  );
};

export default Dashboard;
