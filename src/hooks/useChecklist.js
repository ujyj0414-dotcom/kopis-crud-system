// src/hooks/useChecklist.js

import { useState, useEffect, useCallback } from "react";

export function useChecklist(performanceId) {
  const getInitialItems = () => {
    try {
      const storedData = localStorage.getItem(`checklist_${performanceId}`);
      if (!storedData) {
        return [];
      }
      const parsedData = JSON.parse(storedData);
      if (Array.isArray(parsedData)) {
        return parsedData.map((item) => ({
          ...item,
          completed: item.completed || false,
        }));
      }
      return [];
    } catch (error) {
      console.error(
        "Failed to load or parse checklist from localStorage",
        error
      );
      return [];
    }
  };

  const [items, setItems] = useState(getInitialItems);

  useEffect(() => {
    try {
      localStorage.setItem(`checklist_${performanceId}`, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save checklist to localStorage", error);
    }
  }, [items, performanceId]);

  const addItem = useCallback((text) => {
    if (!text || !text.trim()) return;
    const newItem = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
    };
    setItems((prevItems) => [...prevItems, newItem]);
  }, []);

  const toggleItem = useCallback((id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }, []);

  const deleteItem = useCallback((id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id, newText) => {
    if (!newText || !newText.trim()) return;
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, text: newText.trim() } : item
      )
    );
  }, []);

  return { items, addItem, toggleItem, deleteItem, updateItem };
}
