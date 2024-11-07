
import "./App.css";
import Nav from "./components/Nav";
import GroceryList from "./containers/GroceryList";
import MealPlanner from "./containers/MealPlanner";

function App() {
  return (
   
       <>
        <Nav />
       <div className="container d-flex flex-column justify-content-center align-items-center p-5 " >
          <MealPlanner />
        <GroceryList />
        </div>

        </>
   
  );
}

export default App;
