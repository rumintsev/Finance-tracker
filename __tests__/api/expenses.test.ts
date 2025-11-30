import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { GET as getExpenses, POST as postExpense } from "@/app/api/expenses/route";
import { PATCH as patchExpense } from "@/app/api/expenses/[id]/route";
import { DELETE as deleteExpense } from "@/app/api/expenses/[id]/route";
import { GET as searchExpenses } from "@/app/api/search/route";

function mockNextRequest(url: string, method = "GET", body?: any) {
  const init: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) init.body = JSON.stringify(body);
  return new NextRequest(new Request(url, init));
}

let testId: string;

describe("Expense API", () => {
  beforeAll(async () => {
    const searchReq = mockNextRequest("http://localhost/api/search?q=Test");
    const searchRes = await searchExpenses(searchReq);
    const searchData = await searchRes.json();
    for (const item of searchData) {
      if (item.name.indexOf('__Test__') !== -1) {
        const delReq = mockNextRequest(
          `http://localhost/api/expense/${item.id}`,
          "DELETE"
        );
        await deleteExpense(delReq, { params: Promise.resolve({ id: item.id }) });
      }
    }
  });

  it("POST /api/expense", async () => {
    const reqBody = {
      name: "__Test__",
      amount: 100,
      date: "2025-11-30",
    };

    const req = mockNextRequest("http://localhost/api/expense", "POST", reqBody);
    const res = await postExpense(req);
    const data = await res.json();

    expect(data.id).toBeDefined();
    expect(data.name).toBe(reqBody.name);
    expect(data.amount).toBe(reqBody.amount);
    expect(data.date).toBe(reqBody.date);

    testId = data.id;
  });

  it("GET /api/expense", async () => {
    const res = await getExpenses();
    const data = await res.json();

    const created = data.data.find((x: any) => x.id === testId);
    expect(created.id).toBeDefined();
    expect(created.name).toBe("__Test__");
    expect(created.amount).toBe(100);
    expect(created.date).toBe("2025-11-30");
  });

  it("PATCH /api/expense/:id", async () => {
    const req = mockNextRequest(
      `http://localhost/api/expense/${testId}`,
      "PATCH",
      { amount: 67 }
    );
    const res = await patchExpense(req, { params: Promise.resolve({ id: testId }) });
    const data = await res.json();
    expect(data.amount).toBe(67);
  });

  it("PATCH /api/expense/:id non-existent", async () => {
    const req = mockNextRequest(
      `http://localhost/api/expense/999999`,
      "PATCH",
      { amount: 123 }
    );
    const res = await patchExpense(req, { params: Promise.resolve({ id: "999999" }) });
    expect(res.status).toBe(404);
  });

  it("GET /api/search", async () => {
    const searchReq = mockNextRequest("http://localhost/api/search?q=__Test__");
    const searchRes = await searchExpenses(searchReq);
    const searchData = await searchRes.json();

    const searched = searchData.find((x: any) => x.id === testId);
    expect(searched.id).toBeDefined();
    expect(searched.name).toBe("__Test__");
    expect(searched.amount).toBe(67);
    expect(searched.date).toBe("2025-11-30");
  });

  it("DELETE /api/expense/:id", async () => {
    const req = mockNextRequest(`http://localhost/api/expense/${testId}`, "DELETE");
    const res = await deleteExpense(req, { params: Promise.resolve({ id: testId }) });
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("DELETE /api/expense/:id non-existent", async () => {
    const req = mockNextRequest(`http://localhost/api/expense/999999`, "DELETE");
    const res = await deleteExpense(req, { params: Promise.resolve({ id: "999999" }) });
    expect(res.status).toBe(404);
  });

  it("GET /api/search no matches", async () => {
    const searchReq = mockNextRequest("http://localhost/api/search?q=__Test__");
    const searchRes = await searchExpenses(searchReq);
    const searchData = await searchRes.json();
    expect(searchData).toEqual([]);
  });
});