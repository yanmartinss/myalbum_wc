import React, { useCallback, useState } from "react";
import { Fab, Tooltip } from "@mui/material";
import { Check, Share } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  userId: string;
}

const BotaoCompartilhar: React.FC<Props> = ({ userId }) => {
  const [copiado, setCopiado] = useState(false);

  const handleClick = useCallback(async () => {
    const url = `${window.location.origin}/shared/${userId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // fallback para navegadores sem suporte a clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }, [userId]);

  return (
    <Tooltip title={copiado ? "Link copiado!" : "Compartilhar álbum"} placement="left">
      <Fab
        onClick={handleClick}
        color={copiado ? "success" : "primary"}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1100,
          boxShadow: copiado
            ? "0 0 20px rgba(76, 175, 80, 0.5)"
            : "0 0 20px rgba(25, 118, 210, 0.4)",
          transition: "box-shadow 0.3s ease, transform 0.2s ease",
          "&:hover": {
            transform: "scale(1.1)",
          },
        }}
      >
        <AnimatePresence mode="wait">
          {copiado ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex" }}
            >
              <Check />
            </motion.div>
          ) : (
            <motion.div
              key="share"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex" }}
            >
              <Share />
            </motion.div>
          )}
        </AnimatePresence>
      </Fab>
    </Tooltip>
  );
};

export default BotaoCompartilhar;
