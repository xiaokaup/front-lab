import React, { useState, useRef, useEffect } from "react";
import "./AutocompleteTextarea_v2.css";

const AutocompleteTextarea = () => {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestionPosition, setSuggestionPosition] = useState({
    top: 0,
    left: 0,
  });
  const textareaRef = useRef(null);
  const suggestionsListRef = useRef(null);
  const suggestionItemsRef = useRef([]);

  // 示例建议列表
  const suggestionsList = {
    "#": ["标题", "重要", "任务", "提醒", "a", "b", "c"],
    "@": ["用户1", "用户2", "用户3", "团队", "a", "b", "c"],
    "/": ["日期", "时间", "文件", "图片", "a", "b", "c"],
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
  const checkForTriggerCharacter = (text: string, position: number) => {
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
        setSelectedIndex(0);
        setShowSuggestions(true);
        // 重置引用数组
        suggestionItemsRef.current = [];
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
  const navigateSuggestion = (direction: number) => {
    // direction: 1 || -1
    const newIndex =
      (selectedIndex + direction + suggestions.length) % suggestions.length;
    setSelectedIndex(newIndex);
    setSelectedSuggestion(suggestions[newIndex]);

    // 确保选中项可见（滚动到视图中）
    if (suggestionsListRef.current && suggestionItemsRef.current[newIndex]) {
      const container = suggestionsListRef.current;
      const item = suggestionItemsRef.current[newIndex];

      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      // 如果选中项在容器底部之下
      if (itemRect.bottom > containerRect.bottom) {
        container.scrollTop += itemRect.bottom - containerRect.bottom;
      }
      // 如果选中项在容器顶部之上
      else if (itemRect.top < containerRect.top) {
        container.scrollTop -= containerRect.top - itemRect.top;
      }
    }
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
  const handleSuggestionClick = (suggestion: string) => {
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

  // 更新计算光标位置的函数
  const updateCursorCoordinates = () => {
    if (!textareaRef.current || !showSuggestions) return;

    const textarea = textareaRef.current;
    const textBeforeCursor = value.slice(0, cursorPosition);

    // 创建一个临时元素来计算文本宽度
    const mirror = document.createElement("div");
    mirror.style.position = "absolute";
    mirror.style.top = "0";
    mirror.style.left = "0";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.width = `${textarea.clientWidth}px`;
    mirror.style.padding = window.getComputedStyle(textarea).padding;
    mirror.style.font = window.getComputedStyle(textarea).font;
    mirror.style.lineHeight = window.getComputedStyle(textarea).lineHeight;

    // 将文本分割成行
    const lines = textBeforeCursor.split("\n");

    // 计算光标所在行之前的所有行的高度
    for (let i = 0; i < lines.length - 1; i++) {
      const lineDiv = document.createElement("div");
      lineDiv.textContent = lines[i] || " ";
      mirror.appendChild(lineDiv);
    }

    // 添加光标所在行
    const lastLineDiv = document.createElement("span");
    lastLineDiv.textContent = lines[lines.length - 1] || " ";
    mirror.appendChild(lastLineDiv);

    document.body.appendChild(mirror);

    // 计算位置
    const lastLine = mirror.lastChild;
    const cursorLeft = lastLine.offsetWidth;
    const cursorTop = mirror.offsetHeight;

    document.body.removeChild(mirror);

    // 计算建议列表的位置
    const textareaRect = textarea.getBoundingClientRect();
    const paddingTop = parseInt(window.getComputedStyle(textarea).paddingTop);
    const paddingLeft = parseInt(window.getComputedStyle(textarea).paddingLeft);

    // 设置建议列表位置，确保不会超出textarea边界
    const offsetHeight = 40;
    setSuggestionPosition({
      top:
        offsetHeight +
        Math.min(cursorTop + paddingTop, textarea.clientHeight - 150), // 150是建议列表的估计高度
      left: Math.min(cursorLeft + paddingLeft, textarea.clientWidth - 200), // 200是建议列表的估计宽度
    });
  };

  // 在光标位置或显示状态改变时更新位置
  useEffect(() => {
    updateCursorCoordinates();
  }, [cursorPosition, showSuggestions, value]);

  // 当窗口大小改变时更新位置
  useEffect(() => {
    window.addEventListener("resize", updateCursorCoordinates);
    return () => {
      window.removeEventListener("resize", updateCursorCoordinates);
    };
  }, []);

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

        {/* 将建议列表放在textarea内部 */}
        {showSuggestions && (
          <div
            ref={suggestionsListRef}
            className="suggestions-list inside-textarea"
            style={{
              top: `${suggestionPosition.top}px`,
              left: `${suggestionPosition.left}px`,
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                ref={(el) => (suggestionItemsRef.current[index] = el)}
                className={`suggestion-item ${
                  index === selectedIndex ? "selected" : ""
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutocompleteTextarea;
