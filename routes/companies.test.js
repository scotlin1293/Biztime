// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function() {
  let result = await db.query(`
    INSERT INTO
      companies (code, name, description) VALUES ('TestCat', 'TestCatHQ', 'a company that test with cats')
      RETURNING code, name, description`);
  testCompany = result.rows[0];
});

afterAll(async function() {
    // close db connection
    await db.end();
  });

describe("GET /companies", function() {
    test("Gets a list of 1 company", async function() {
      const response = await request(app).get(`/companies`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(
     [testCompany]
      );
    });

    test("Responds with 404 if can't find company", async function() {
        const response = await request(app).get(`/companies/0`);
        expect(response.statusCode).toEqual(404);
      });
  });


  describe("POST /companies", function() {
    test("Creates a new company", async function() {
      const response = await request(app)
        .post(`/companies`)
        .send({
          code: "Comp1",
          name: "Company1",
          description: "1 great company"
        });
      expect(response.statusCode).toEqual(201);
      expect(response.body.code).toBe(
          "Comp1"
      );
    });
  });

  describe("PATCH /companies/:code", function() {
    test("Updates a single company", async function() {
      const response = await request(app)
        .patch(`/companies/${testCompany.code}`)
        .send({
          name: "Troll"
        });
      expect(response.statusCode).toEqual(200);
      expect(response.body.name).toEqual(
        "Troll"
      );
    });
  });



  describe("DELETE /companies/:code", function() {
    test("Deletes a single a company", async function() {
      const response = await request(app)
        .delete(`/companies/${testCompany.code}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ message: "Deleted" });
    });
  });

afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM companies");
  });
  