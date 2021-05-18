const db = require("../db");
const express = require("express");
const router = express.Router();
const slugify = require('slugify')

/**  Get  companies */

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(
          `SELECT code, name, description FROM companies`);

    return res.json(results.rows);
  }

  catch (err) {
    return next(err);
  }
});

router.get("/:code", async function(req,res,next){
  try{
      const code = req.query.code;
     const result = await db.query(
         `SELECT code, name, description WHERE code = '${code}'`
     );
     return res.json(result.rows)
  } catch(e){}
});

/** Create new company */

router.post("/", async function (req, res, next) {
  try {
    const { code, name, description } = req.body;

    const result = await db.query(
          `INSERT INTO companies (code, name, description) 
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
        [code, name, description ]
    );

    return res.status(201).json(result.rows[0]);
  }

  catch (err) {
    return next(err);
  }
});


/** Update company */

router.patch("/:code", async function (req, res, next) {
  try {
    const { name, description } = req.body;
    let code = slugify(name)

    const result = await db.query(
          `UPDATE companies SET name=$1, description=$2
           WHERE code = $3
           RETURNING code, name, description`,
        [code,name, description]
    );

    return res.json(result.rows[0]);
  }

  catch (err) {
    return next(err);
  }
});


/** Delete company {message: "Deleted"} */

router.delete("/:code", async function (req, res, next) {
  try {
    const result = await db.query(
        "DELETE FROM companies WHERE code = $1",
        [req.params.code]
    );

    return res.json({message: "Deleted"});
  }

  catch (err) {
    return next(err);
  }
});
// end


module.exports = router;