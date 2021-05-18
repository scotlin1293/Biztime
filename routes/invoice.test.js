process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testInv;

beforeEach(async function() {
  let result = await db.query(`
    INSERT INTO
      invoices (comp_code, amt, paid, add_date, paid_date) VALUES ('TestCat', 300, true, '2017-01-01', '2018-01-01')
      RETURNING comp_code, amt, paid, add_date, paid_date`);
  testInv = result.rows[0];
});

describe("GET /invoices", function() {
    test("Gets a list of 1 invoice", async function() {
      const response = await request(app).get(`/invoices`);
      expect(response.statusCode).toEqual(200);
      expect(response.body[0]["comp_code"]).toEqual("TestCat");
    });
  });


  describe("POST /invoicies", function() {
    test("Creates a new invoice", async function() {
      const response = await request(app)
        .post(`/invoices`)
        .send({
          id: 5687,  
          comp_code: "hola",
          amt: 444,
          paid: true,
          add_date: '2013-01-01',
          paid_date: '2017-02-01'
        });
      expect(response.body).toBe(
          "hola"
      );
    });
  });

  describe("PATCH /invoices/:id", function() {
    test("Updates a single invoice", async function() {
      const response = await request(app)
        .patch(`/invoices/${testInv.id}`)
        .send({
          id: "100"
        });
      expect(response.body.id).toEqual(
        "100"
      );
    });
  });



  describe("DELETE /invoices/:id", function() {
    test("Deletes a single invoice", async function() {
      const response = await request(app)
        .delete(`/invoices/${testInv.id}`);
      expect(response.body).toEqual({ message: "Deleted" });
    });
  });

afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM invoices");
  });
  
  afterAll(async function() {
    // close db connection
    await db.end();
  });