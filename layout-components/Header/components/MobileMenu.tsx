"use client";

import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Navigation from "../../../components/Navigation";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpenMenu = () => {
    document.body.style.overflow = "hidden";
    setIsOpen(true);
  };
  const handleCloseMenu = () => {
    document.body.style.overflow = "auto";
    setIsOpen(false);
  };
  return (
    <>
      <button
        className="btn rounded-sm border border-yellow-500 px-4 py-2.5 xl:hidden"
        type="button"
        aria-label="Pulsante aprire menu"
        onClick={handleOpenMenu}
      >
        Menu
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile"
            // ref={dialog}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-1000 bg-black/50 xl:hidden"
            //min-h-dvh min-w-dvw
            aria-modal="true"
            onClick={handleCloseMenu}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-black px-4 py-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="btn mr-0 ml-auto flex rounded-sm border border-amber-500 px-4 py-3 text-white"
                aria-label="Chiudi menu"
                onClick={handleCloseMenu}
              >
                Chiudi
              </button>
              <Suspense>
                <Navigation
                  linkPY="py-5"
                  mobile
                  onClick={handleCloseMenu}
                  className="mt-8 ml-0 flex max-w-full flex-col items-start pl-0 text-white xl:hidden"
                />
              </Suspense>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
