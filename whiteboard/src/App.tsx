import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Board from './Board'
import axios from 'axios'
import NavBar from './Navbar'

function App() {
  const [color, setColor] = useState<string>('#D0FF00')
  const [size, setSize] = useState<string>('5')
  const [deviceWidth, setDeviceWidth] = useState<number>(window.innerWidth)

  const isMobile = deviceWidth <= 768

  const handleSizeChange = () => {
    setDeviceWidth(window.innerWidth)
  }

  if (window.location.pathname === '/super-secret-board-clear') {
    // Super secret way to clear the board
    axios.get(import.meta.env.VITE_API_BASE_URL + '/super-secret-board-clear')
  }

  useEffect(() => {
    window.addEventListener('resize', handleSizeChange)
    return () => {
        window.removeEventListener('resize', handleSizeChange)
    }
  }, [])
  

  return (
    <div className="App">
      <div className="container">
        <div className='navbar'>
          <NavBar isMobile={isMobile}/>
            <div className="tools-section">
              <div className="color-picker-container">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}/>
              </div>
                <div className="brushsize-container">
                
                  <select value={size} onChange={(e) => setSize(e.target.value)}>
                    <option> 5 </option>
                    <option> 10 </option>
                    <option> 15 </option>
                    <option> 20 </option>
                    <option> 25 </option>
                    <option> 30 </option>
                </select>
              </div>
            </div>
          </div>
        <div className="board-container">
          <Board color={color} size={size} isMobile={isMobile}></Board>
        </div>
    </div>
    </div>
  )
}

export default App
