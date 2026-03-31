import test from "node:test";
import assert from "node:assert/strict";
import Exam from "../models/Exam.js";
import { listExams } from "./examController.js";

function createRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

test("listExams returns paginated exam payload", async () => {
  const originalFind = Exam.find;
  const originalCountDocuments = Exam.countDocuments;

  try {
    Exam.find = () => ({
      sort() {
        return this;
      },
      skip() {
        return this;
      },
      limit() {
        return this;
      },
      populate() {
        return Promise.resolve([{ _id: "e1", title: "Exam 1", isPublished: true }]);
      }
    });
    Exam.countDocuments = async () => 1;

    const req = { query: { page: "1", limit: "10", isPublished: "true" } };
    const res = createRes();
    let forwardedError = null;

    await listExams(req, res, (err) => {
      forwardedError = err;
    });

    assert.equal(forwardedError, null);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.items.length, 1);
    assert.equal(res.body.pagination.total, 1);
  } finally {
    Exam.find = originalFind;
    Exam.countDocuments = originalCountDocuments;
  }
});
