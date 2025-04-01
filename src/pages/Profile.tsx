
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { UserCircle } from "lucide-react";
import { useEffect } from "react";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-gray-100 rounded-full p-2 inline-block">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.username || "Profil utilisateur"} 
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <UserCircle className="w-24 h-24 text-gray-400" />
              )}
            </div>
            <CardTitle className="text-2xl">{currentUser.username || "Utilisateur"}</CardTitle>
            <CardDescription>{currentUser.email}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-forest mb-2">Membre depuis</h3>
              <p className="text-gray-600">
                {new Date(currentUser.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-forest mb-2">Spots favoris</h3>
              {currentUser.favorites && currentUser.favorites.length > 0 ? (
                <ul className="list-disc pl-5 text-gray-600">
                  {currentUser.favorites.map((favorite, index) => (
                    <li key={index}>{favorite}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">Aucun spot favori pour le moment</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleLogout}
              className="w-full bg-forest hover:bg-forest-dark"
            >
              Se déconnecter
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      <footer className="bg-gray-900 text-white/70 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Trail Mosaic. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
