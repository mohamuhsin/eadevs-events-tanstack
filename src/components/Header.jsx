/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
export default function Header({ children }) {
  return (
    <>
      <div id="main-header-loading"></div>
      <header id="main-header">
        <div id="header-title">
          <Link to="/"><h1>Eadevs Events</h1></Link>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
