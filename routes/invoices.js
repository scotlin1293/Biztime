const db = require("../db");
const express = require("express");
const router = express.Router();


/**  Get  invoices */

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(
          `SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices`);

    return res.json(results.rows);
  }

  catch (err) {
    return next(err);
  }
});

router.get("/:id", async function(req,res,next){
  try{
      const id = req.query.id;
     const result = await db.query(
         `SELECT id, comp_code, amt, paid, add_date, paid_date WHERE id = '${id}'`
     );
     return res.json(result.rows)
  } catch(e){}
});

/** Create new invoice */

router.post("/", async function (req, res, next) {
  try {
    const { id, comp_code, amt, paid, add_date, paid_date } = req.body;

    const result = await db.query(
          `INSERT INTO invoices (id, comp_code, amt, paid, add_date, paid_date ) 
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, comp_code, amt, paid, add_date, paid_date `,
        [id, comp_code, amt, paid, add_date, paid_date]
    );

    return res.status(201).json(result.rows[0]);
  }

  catch (err) {
    return next(err);
  }
});


/** Update invoice*/

router.put("/:id", async function (req, res, next) {
  try {
    let {amt, paid} = req.body;
    let id = req.params.id;
    let paidDate = null;
//setting initial vals
    const currResult = await db.query(
          `SELECT paid
           FROM invoices
           WHERE id = $1`,
        [id]);
// getting current result
    if (currResult.rows.length === 0) {
      throw new ExpressError(`No such invoice: ${id}`, 404);
    } //throwing 404 if no result, checking against currentresult

    const currPaidDate = currResult.rows[0].paid_date;
//getting current paid date
    if (!currPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null
    } else {
      paidDate = currPaidDate;
    }
//if both paid and no date, set new current date as paid date
    const result = await db.query(
          `UPDATE invoices
           SET amt=$1, paid=$2, paid_date=$3
           WHERE id=$4
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [amt, paid, paidDate, id]);
//grabbing result
    return res.json({"invoice": result.rows[0]}); //returning val
  }

  catch (err) {
    return next(err);
  } //obligatory err handler

});


/** Delete invoice, returning {message: "Deleted"} */

router.delete("/:id", async function (req, res, next) {
  try {
    const result = await db.query(
        "DELETE FROM invoices WHERE id = $1",
        [req.params.id]
    );

    return res.json({message: "Deleted"});
  }

  catch (err) {
    return next(err);
  }
});
// end


module.exports = router;