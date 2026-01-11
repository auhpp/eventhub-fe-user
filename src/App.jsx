import { Fragment } from "react";
import { publicRoutes } from "./routes/route.js";
import { Route, Routes } from "react-router-dom";

function App() {

  return (
    <>
      <Routes>
        {publicRoutes.map(
          (item, index) => {
            var Page = item.page;
            let Layout = Fragment;
            if (item.layout) {
              Layout = item.layout;
            }
            else if (item.layout === null) {
              Layout = Fragment;
            }
            return (
              <Route
                key={index}
                index={index}
                path={item.path}
                element={<Layout><Page /></Layout>}
              />
            );
          }
        )}
      </Routes>
    </>
  )
}

export default App
