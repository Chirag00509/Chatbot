import './Header.css'
import  { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

function Header() {

    return (
        <>
            <div className="header">
                <a href="" className="logo">Chat</a>
                <div className="header-right">
                    <a className="newchat" href="#home">+ New Chat</a>
                    <a><FontAwesomeIcon icon={faUser} className='icon' /></a>
                </div>
            </div>
        </>
    )
}

export default Header
