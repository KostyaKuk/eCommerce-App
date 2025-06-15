import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { Cart } from "@commercetools/platform-sdk";
import { getOrCreateCustomerCart, getAnonymousCart, createAnonymousCart } from "../utils/api";

interface CartContextType {
  cart: Cart | null;
  setCart: React.Dispatch<React.SetStateAction<Cart | null>>;
  totalLineItemQuantity: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [totalLineItemQuantity, setTotalLineItemQuantity] = useState(0);

  const loadCart = async () => {
    console.log("CartContext: Loading cart... isLoggedIn:", isLoggedIn);
    try {
      if (isLoggedIn) {
        console.log("CartContext: Loading customer cart...");
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
          const customerCart = await getOrCreateCustomerCart(accessToken);
          console.log("CartContext: Customer cart loaded:", customerCart);
          setCart(customerCart);
        } else {
          console.log("CartContext: No access token, skipping customer cart load");
          setCart(null);
        }
      } else {
        console.log("CartContext: Loading anonymous cart...");
        const anonymousCartId = localStorage.getItem("anonymousCartId");
        if (anonymousCartId) {
          console.log("CartContext: Fetching anonymous cart with ID:", anonymousCartId);
          const anonymousCart = await getAnonymousCart(anonymousCartId);
          if (anonymousCart) {
            console.log("CartContext: Anonymous cart loaded:", anonymousCart);
            setCart(anonymousCart);
          } else {
            console.log("CartContext: Anonymous cart not found, creating new one...");
            const newCart = await createAnonymousCart();
            localStorage.setItem("anonymousCartId", newCart.id);
            console.log("CartContext: New anonymous cart created:", newCart);
            setCart(newCart);
          }
        } else {
          console.log("CartContext: No anonymousCartId, setting cart to null");
          setCart(null);
        }
      }
    } catch (error) {
      console.error("CartContext: Error loading cart:", error);
      setCart(null);
    }
  };

  useEffect(() => {
    loadCart();
  }, [isLoggedIn]);

  useEffect(() => {
    const quantity = cart?.lineItems.reduce((sum, item) => sum + item.quantity, 0) || 0;
    console.log("CartContext: Updating totalLineItemQuantity:", quantity);
    setTotalLineItemQuantity(quantity);
  }, [cart]);

  return <CartContext.Provider value={{ cart, setCart, totalLineItemQuantity }}>{children}</CartContext.Provider>;
};
