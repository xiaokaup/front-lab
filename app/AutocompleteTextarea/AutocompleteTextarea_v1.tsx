import React, { useState, useRef, useEffect } from "react";
import "./AutocompleteTextarea_v1.css";

const AutocompleteTextarea_v1 = () => {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  // 示例建议列表
  const suggestionsList = {
    "#": ["标题", "重要", "任务", "提醒"],
    "@": ["用户1", "用户2", "用户3", "团队"],
    "/": ["日期", "时间", "文件", "图片"],
  };

  // 处理输入变化
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);

    const position = e.target.selectionStart;
    setCursorPosition(position);

    // 检查是否应该显示建议
    checkForTriggerCharacter(newValue, position);
  };

  // 检查触发字符
  const checkForTriggerCharacter = (text, position) => {
    // 获取光标前的文本
    const textBeforeCursor = text.slice(0, position);

    // 查找最后一个触发字符
    const triggerChars = Object.keys(suggestionsList);
    let lastTriggerChar = "";
    let lastTriggerIndex = -1;

    triggerChars.forEach((char) => {
      const index = textBeforeCursor.lastIndexOf(char);
      if (index > lastTriggerIndex) {
        lastTriggerIndex = index;
        lastTriggerChar = char;
      }
    });

    // 如果找到触发字符，并且它后面没有空格（表示正在输入命令）
    if (
      lastTriggerIndex !== -1 &&
      (lastTriggerIndex === textBeforeCursor.length - 1 ||
        !textBeforeCursor.slice(lastTriggerIndex + 1).includes(" "))
    ) {
      const query = textBeforeCursor.slice(lastTriggerIndex + 1);
      const filteredSuggestions = suggestionsList[lastTriggerChar].filter(
        (item) => item.toLowerCase().startsWith(query.toLowerCase()),
      );

      if (filteredSuggestions.length > 0) {
        setSuggestions(filteredSuggestions);
        setSelectedSuggestion(filteredSuggestions[0]);
        setShowSuggestions(true);
        return;
      }
    }

    // 如果没有找到有效的触发字符或匹配项
    setShowSuggestions(false);
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "Tab") {
      e.preventDefault();
      completeSuggestion();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      navigateSuggestion(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      navigateSuggestion(1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Enter" && showSuggestions) {
      e.preventDefault();
      completeSuggestion();
    }
  };

  // 在建议列表中导航
  const navigateSuggestion = (direction) => {
    const currentIndex = suggestions.indexOf(selectedSuggestion);
    const nextIndex =
      (currentIndex + direction + suggestions.length) % suggestions.length;
    setSelectedSuggestion(suggestions[nextIndex]);
  };

  // 完成建议输入
  const completeSuggestion = () => {
    if (!selectedSuggestion) return;

    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);

    // 找到最后一个触发字符
    const triggerChars = Object.keys(suggestionsList);
    let lastTriggerChar = "";
    let lastTriggerIndex = -1;

    triggerChars.forEach((char) => {
      const index = textBeforeCursor.lastIndexOf(char);
      if (index > lastTriggerIndex) {
        lastTriggerIndex = index;
        lastTriggerChar = char;
      }
    });

    if (lastTriggerIndex !== -1) {
      const textBeforeTrigger = textBeforeCursor.slice(0, lastTriggerIndex + 1);
      const query = textBeforeCursor.slice(lastTriggerIndex + 1);

      // 创建新的文本值
      const newValue =
        textBeforeTrigger + selectedSuggestion + " " + textAfterCursor;
      setValue(newValue);

      // 更新光标位置
      const newPosition = lastTriggerIndex + 1 + selectedSuggestion.length + 1;

      // 在下一个渲染周期设置光标位置
      setTimeout(() => {
        textareaRef.current.selectionStart = newPosition;
        textareaRef.current.selectionEnd = newPosition;
      }, 0);
    }

    setShowSuggestions(false);
  };

  // 选择建议
  const handleSuggestionClick = (suggestion) => {
    setSelectedSuggestion(suggestion);
    completeSuggestion();
  };

  // 获取预输入文本
  const getGhostText = () => {
    if (!showSuggestions || !selectedSuggestion) return "";

    const textBeforeCursor = value.slice(0, cursorPosition);
    const triggerChars = Object.keys(suggestionsList);
    let lastTriggerChar = "";
    let lastTriggerIndex = -1;

    triggerChars.forEach((char) => {
      const index = textBeforeCursor.lastIndexOf(char);
      if (index > lastTriggerIndex) {
        lastTriggerIndex = index;
        lastTriggerChar = char;
      }
    });

    if (lastTriggerIndex !== -1) {
      const query = textBeforeCursor.slice(lastTriggerIndex + 1);
      return selectedSuggestion.slice(query.length);
    }

    return "";
  };

  return (
    <div className="autocomplete-container">
      <div className="textarea-wrapper">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="textarea"
          placeholder="输入 #, @ 或 / 触发自动完成..."
        />
        {showSuggestions && (
          <div className="ghost-text">
            {value.slice(0, cursorPosition)}
            <span className="suggestion-preview">{getGhostText()}</span>
            {value.slice(cursorPosition)}
          </div>
        )}
      </div>

      {showSuggestions && (
        <div className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`suggestion-item ${
                suggestion === selectedSuggestion ? "selected" : ""
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteTextarea_v1;
