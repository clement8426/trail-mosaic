
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, Calendar, Menu, X, LogIn, UserPlus, Bell, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-trail">Trail</span>
          <span className="text-forest">Mosaic</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/map" icon={<Map size={18} />} label="Carte" />
          <NavLink to="/events" icon={<Calendar size={18} />} label="Événements" />
          <NavLink to="/notifications" icon={<Bell size={18} />} label="Notifications" />
          <NavLink to="/create-spot" icon={<PlusCircle size={18} />} label="Ajouter un spot" />
          
          {currentUser ? (
            <>
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-forest-dark"
                onClick={handleLogout}
              >
                Déconnexion
              </Button>
              <Button asChild className="bg-trail hover:bg-trail-dark">
                <Link to="/profile">Mon Profil</Link>
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" icon={<LogIn size={18} />} label="Connexion" />
              <Button asChild className="bg-trail hover:bg-trail-dark">
                <Link to="/register">S'inscrire</Link>
              </Button>
            </>
          )}
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
            to="/events" 
            icon={<Calendar size={20} />} 
            label="Événements" 
            onClick={() => setMobileMenuOpen(false)}
            mobile 
          />
          <NavLink 
            to="/notifications" 
            icon={<Bell size={20} />} 
            label="Notifications" 
            onClick={() => setMobileMenuOpen(false)}
            mobile 
          />
          <NavLink 
            to="/create-spot" 
            icon={<PlusCircle size={20} />} 
            label="Ajouter un spot" 
            onClick={() => setMobileMenuOpen(false)}
            mobile 
          />
          
          {currentUser ? (
            <>
              <NavLink 
                to="/profile" 
                label="Mon Profil" 
                onClick={() => setMobileMenuOpen(false)}
                mobile 
              />
              <Button 
                className="w-full" 
                variant="ghost"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <NavLink 
                to="/login" 
                icon={<LogIn size={20} />} 
                label="Connexion" 
                onClick={() => setMobileMenuOpen(false)}
                mobile 
              />
              <Button 
                asChild
                className="w-full bg-trail hover:bg-trail-dark mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/register">
                  S'inscrire
                </Link>
              </Button>
            </>
          )}
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
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-2 transition-colors",
        mobile 
          ? "text-lg py-3 border-b border-gray-100 w-full justify-center font-medium" 
          : isActive 
            ? "text-forest-dark font-medium" 
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
