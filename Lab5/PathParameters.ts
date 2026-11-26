export default function PathParameters(app) {
  const add = (req, res) => {
    const { a, b } = req.params;
    const sum = parseInt(a) + parseInt(b);
    res.send(sum.toString());
  };

  const subtract = (req, res) => {
    const { a, b } = req.params;
    res.send((parseInt(a) - parseInt(b)).toString());
  };

  const multiply = (req, res) => {
    const { a, b } = req.params;
    res.send((parseInt(a) * parseInt(b)).toString());
  };

  const divide = (req, res) => {
    const { a, b } = req.params;
    const numerator = parseFloat(a);
    const denominator = parseFloat(b);

    if (denominator === 0) {
      res.status(400).send("Cannot divide by zero");
      return;
    }

    res.send((numerator / denominator).toString());
  };

  app.get("/lab5/add/:a/:b", add);
  app.get("/lab5/subtract/:a/:b", subtract);
  app.get("/lab5/multiply/:a/:b", multiply);
  app.get("/lab5/divide/:a/:b", divide);
}
