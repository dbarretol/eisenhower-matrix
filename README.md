
=========================

## 🧠 Project Overview
Create a desktop-based productivity app in Python that allows users to manually input tasks and visually organize them using an interactive **Eisenhower Matrix**. The app should support task persistence, drag-and-drop prioritization, and allow task deletion only by the user.

---

## 🖥️ Application UI Layout

### Main Interface Structure
| Section        | Position | Description |
|----------------|----------|-------------|
| **Task Input Panel** | Left side | • A scrollable list of tasks entered manually<br>• Text input field for new task entry<br>• “Add Task” button to submit<br>• Tasks here are initially unassigned |
| **Eisenhower Matrix View** | Right side | • 2x2 grid representing four quadrants:<br> 1. Urgent & Important<br> 2. Not Urgent but Important<br> 3. Urgent but Not Important<br> 4. Not Urgent & Not Important<br>• Each quadrant displays assigned tasks<br>• Tasks can be dragged from the list or between quadrants |

---

## ✅ Core Features & Behavior

### Task Management
- 💬 **Manual Input**: User types a task and clicks “Add Task” to create a new item.
- 📦 **Unsorted Tasks**: New tasks appear on the left panel until assigned a quadrant.
- 🖱️ **Drag & Drop**: Tasks can be moved freely to any quadrant or between quadrants.
- 🗑️ **Delete Control**: Only the user may delete tasks via a delete button/icon next to each task.

### Matrix Quadrants
- Each quadrant shows:
  - Title (e.g. “Urgent & Important”)
  - List of assigned tasks
- Quadrants automatically update as tasks are moved.

### Task Persistence
- 🧷 **Data Saving**: Use local file storage or lightweight database (e.g. SQLite or JSON) to keep task data.
- 💾 **On Close**: When the app is closed, all tasks and their positions in the matrix are saved.
- ♻️ **On Start**: When reopened, tasks are reloaded into their previous positions.

---

## 🛠️ Technical Details & Suggestions

### Tech Stack
- **Language**: Python 3.x
- **GUI Framework**: Recommended options:
  - `Tkinter` (simple, built-in)
  - `PyQt5` (more powerful, supports drag-and-drop natively)
- **Data Storage**:
  - JSON file (easy to manage)
  - OR SQLite database for more flexibility

### Drag-and-Drop Implementation
- Use built-in drag support in the GUI framework (e.g., `QDrag` in PyQt5).
- Tasks should update their quadrant assignment visually and internally.

### Task Object Structure (example)
```json
{
  "task_id": 1,
  "text": "Finish the budget report",
  "quadrant": "urgent_important",
  "created": "2025-07-22T20:36:00",
  "completed": false
}
```

---

## 🌟 Optional Add-ons
- ✅ Checkbox to mark task as “completed”
- 🔍 Search bar for filtering tasks
- 🎨 Theme customization (dark/light mode)
- 🔔 Notifications for Quadrant 1 tasks


================================
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```