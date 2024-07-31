import "./Footer.css";

const Footer = () => {
  return (
    <div className="footer">
      <p>
        Copyright &copy; {new Date().getFullYear()}, Mahmoud Al Jarad, HS Trier
      </p>
    </div>
  );
};

export default Footer;
