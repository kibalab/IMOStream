import Express from "express";
import Route from "./router";

const app = Express();
app.get('/:id', Route);

app.listen(8080, () => {
    console.log(`server is listening at localhost:8080`);
});