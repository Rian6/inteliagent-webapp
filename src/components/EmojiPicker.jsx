import { useState } from "react";
import { Box, Tabs, Tab, IconButton, Typography } from "@mui/material";
import { emojiCategories } from "../data/emojis";
export default function EmojiPicker({ onSelect, disabled }) {
  const [category, setCategory] = useState("popular");
  const selected = emojiCategories.find((item) => item.id === category);
  return (
    <Box sx={{ mt: 1, p: 1, bgcolor: "white", borderRadius: 2, minWidth: 0 }}>
      <Tabs
        value={category}
        onChange={(_, value) => setCategory(value)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Categorias de emojis"
        sx={{ minHeight: 44 }}
      >
        {emojiCategories.map((item) => (
          <Tab
            key={item.id}
            value={item.id}
            label={item.icon}
            aria-label={item.title}
            title={item.title}
            sx={{ minWidth: 48, minHeight: 44, fontSize: 24, p: 1 }}
          />
        ))}
      </Tabs>
      <Typography sx={{ fontSize: 12, color: "text.secondary", my: 1 }}>
        {selected.title} · {selected.emojis.length} emojis
      </Typography>
      <Box
        role="group"
        aria-label="Emojis"
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(42px,1fr))",
          maxHeight: 220,
          overflowY: "auto",
        }}
      >
        {selected.emojis.map((value) => (
          <IconButton
            key={value}
            aria-label={"Inserir emoji " + value}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(value)}
            sx={{ fontSize: 25, width: 42, height: 42 }}
          >
            {value}
          </IconButton>
        ))}
      </Box>
    </Box>
  );
}
