import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  BellIcon 
} from '@heroicons/react/24/outline'

function Header() {
  const { user, logout } = useAuth()
  const [notifications] = useState(3) // Mock notification count

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt={import.meta.env.VITE_APP_NAME} 
              className="h-8 w-auto mr-3"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <h1 className="text-xl font-semibold text-gray-900">
              {import.meta.env.VITE_APP_NAME || 'Atma-Chethana'}
            </h1>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <BellIcon className="h-6 w-6" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <UserCircleIcon className="h-8 w-8" />
                <span className="hidden md:block text-sm font-medium">
                  {user?.name || 'Counsellor'}
                </span>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <p className="font-medium">{user?.name || 'Counsellor'}</p>
                          <p className="text-gray-500">{user?.email || 'counsellor@atmachethana.com'}</p>
                        </div>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
