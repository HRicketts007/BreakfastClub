
import "./App.css";
import Nav from "./components/Nav";
import MealPlanner from "./containers/MealPlanner";

function App() {
  return (
   
       <>
        <Nav />
       <div className="container d-flex flex-column justify-content-center align-items-center " style={{height:"100vh"}}>
          <MealPlanner />
        </div>

        </>
   
  );
}

export default App;
