
import React from 'react';
import { Link } from 'react-router-dom';
import { Bike, Map, Calendar, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-trail">Trail</span>
          <span className="text-forest">Mosaic</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/map" icon={<Map size={18} />} label="Carte" />
          <NavLink to="/trails" icon={<Bike size={18} />} label="Pistes" />
          <NavLink to="/events" icon={<Calendar size={18} />} label="Événements" />
          <Button className="bg-trail hover:bg-trail-dark">S'inscrire</Button>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "fixed inset-0 z-40 bg-white pt-16 pb-6 transition-transform duration-300 md:hidden",
        mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="container flex flex-col items-center gap-6 px-4">
          <NavLink 
            to="/map" 
            icon={<Map size={20} />} 
            label="Carte" 
            onClick={() => setMobileMenuOpen(false)}
            mobile 
          />
          <NavLink 
            to="/trails" 
            icon={<Bike size={20} />} 
            label="Pistes" 
            onClick={() => setMobileMenuOpen(false)}
            mobile 
          />
          <NavLink 
            to="/events" 
            icon={<Calendar size={20} />} 
            label="Événements" 
            onClick={() => setMobileMenuOpen(false)}
            mobile 
          />
          <Button className="w-full bg-trail hover:bg-trail-dark mt-4">S'inscrire</Button>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  mobile?: boolean;
  onClick?: () => void;
}

const NavLink = ({ to, label, icon, mobile, onClick }: NavLinkProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-2 transition-colors",
        mobile 
          ? "text-lg py-3 border-b border-gray-100 w-full justify-center font-medium" 
          : "text-gray-600 hover:text-forest-dark"
      )}
      onClick={onClick}
    >
      {icon}
      {label}
    </Link>
  );
};

export default Navbar;
