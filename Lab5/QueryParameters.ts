export default function QueryParameters(app) {
  const calculator = (req, res) => {
    const { a, b, operation } = req.query;
    let result = 0;
    switch (operation) {
      case "add":
        result = parseInt(a) + parseInt(b);
        break;
      case "subtract":
        result = parseInt(a) - parseInt(b);
        break;
      case "multiply":
        result = parseFloat(a) * parseFloat(b);
        break;
      case "divide":
        const denominator = parseFloat(b);
        if (denominator === 0) {
          res.status(400).send("Cannot divide by zero");
          return;
        }
        result = parseFloat(a) / denominator;
        break;
      default:
        result = "Invalid operation";
    }
    res.send(result.toString());
  };
  app.get("/lab5/calculator", calculator);
}
