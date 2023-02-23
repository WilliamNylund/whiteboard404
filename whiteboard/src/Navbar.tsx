import React from 'react'

import albin from './assets/albin_black.png'

const NavBar = ( {isMobile}: {isMobile:boolean} ) => {

  const baseUrl = 'https://datateknologerna.org/'
  
  const navItems = [
    ['Evenemang', baseUrl],
    ['Nyheter', baseUrl],
    ['Föreningen', baseUrl],
    ['Gulis', baseUrl],
    ['Årsfest', baseUrl],
    ['Kontakt', baseUrl],
    ['Idrott', baseUrl],
    ['Länkar', baseUrl],
    ['Medlemmar', baseUrl]
  ]

  if (isMobile) {
    return (
      <div className='mobileNavbar'>
        <div className='mobileImg'>
          <img src={albin} alt='Albin' width={50} height={50}></img>
        </div>
        <div className='mobileBurghir'>
          <div className='burghir'></div>
          <div className='burghir'></div>
          <div className='burghir'></div>
        </div>
      </div>
    )
  }

  return (
    <div className='mainNavContainer'>
      <a href={baseUrl}>
        <img src={albin} alt='Albin' width={50} height={50}></img>
      </a>
      <div className='navItemContainer'>
        {navItems.map((item) => 
          <a href={item[1]} className='navItems'>{item[0]}</a>
        ).reverse()}
      </div>
    </div>
  )
}

export default NavBar