import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ApiDemoPage from './pages/ApiDemoPage'
import ComponentsPage from './pages/ComponentsPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/components" element={<ComponentsPage />} />
          <Route path="/api-demo" element={<ApiDemoPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
