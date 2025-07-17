function Tabs({ children, value, onChange }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        {children}
      </nav>
    </div>
  )
}

function Tab({ value, label, children }) {
  const isActive = value === label.toLowerCase()
  
  return (
    <button
      onClick={() => children?.props?.onChange?.(label.toLowerCase())}
      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
        isActive
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

// Fixed Tab component to work with the parent onChange
function TabFixed({ value, label, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
        isActive
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

// Updated Tabs component
function TabsFixed({ value, onChange, children }) {
  // Ensure children is an array
  const childrenArray = Array.isArray(children) ? children : [children].filter(Boolean);
  
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        {childrenArray.map((child, index) => (
          <TabFixed
            key={index}
            value={child.props.value}
            label={child.props.label}
            isActive={value === child.props.value}
            onClick={onChange}
          />
        ))}
      </nav>
    </div>
  )
}

export { TabsFixed as Tabs, Tab }
