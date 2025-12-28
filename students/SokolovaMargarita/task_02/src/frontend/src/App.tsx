import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'

import AppLayout from './layouts/AppLayout'
import AdminLayout from './layouts/AdminLayout'

import Home from './pages/Home'
import Start from './pages/Start'
import About from './pages/About'
import Register from './pages/Register'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import AdminHome from './pages/admin/AdminHome'
import Recipes from './pages/admin/Recipes'
import Ingredients from './pages/admin/Ingredients'
import CreateIngredient from './pages/admin/CreateIngredient'
import EditIngredient from './pages/admin/EditIngredient'
import CreateRecipe from './pages/admin/CreateRecipe'
import EditRecipe from './pages/admin/EditRecipe'
import Recipe from './pages/Recipe'
import UserRecipes from './pages/UserRecipes'
import FindByIngredients from './pages/FindByIngredients'

export default function App() {
  const user = useAuthStore((s) => s.user)

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="start" element={<Start />} />
        <Route path="about" element={<About />} />

        <Route path="register" element={!user ? <Register /> : <Navigate to={'/'} />} />
        <Route path="login" element={!user ? <Login /> : <Navigate to={'/'} />} />

        <Route path="recipes/:recipe_id" element={<Recipe />} />
        <Route path="user-recipes" element={<UserRecipes />} />

        <Route path="find-by-ingredients" element={<FindByIngredients />} />

        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />

          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/create" element={<CreateRecipe />} />
          <Route path="recipes/:recipe_id/edit" element={<EditRecipe />} />

          <Route path="ingredients" element={<Ingredients />} />
          <Route path="ingredients/create" element={<CreateIngredient />} />
          <Route path="ingredients/:ingredient_id/edit" element={<EditIngredient />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
