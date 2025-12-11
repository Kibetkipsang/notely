const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-4 text-center text-sm text-gray-200 border-t ">
      <p className="text-gray-600">
        Made with ❤️ by <span className="font-semibold">Kibet Dennis</span> &copy; {year} All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
