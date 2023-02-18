import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Board from './Board'

function App() {
  const [color, setColor] = useState<string>('#000000')
  const [size, setSize] = useState<string>('5')
<<<<<<< Updated upstream
  const [deviceWidth, setDeviceWidth] = useState<number>(window.innerWidth)

  const isMobile = deviceWidth <= 768

  const handleSizeChange = () => {
    setDeviceWidth(window.innerWidth)
  }

  useEffect(() => {
    window.addEventListener('resize', handleSizeChange)
    return () => {
        window.removeEventListener('resize', handleSizeChange)
    }
  }, [])
  

=======
  
>>>>>>> Stashed changes
  return (
    <div className="App">
      <div className="container">
                <div className="tools-section">
                    <div className="color-picker-container">
                        Select Brush Color : &nbsp; 
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)}/>
                    </div>

                    <div className="brushsize-container">
                        Select Brush Size : &nbsp; 
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

                <div className="board-container">
                    <Board color={color} size={size} isMobile={isMobile}></Board>
                </div>
            </div>
    </div>
  )
}

export default App
