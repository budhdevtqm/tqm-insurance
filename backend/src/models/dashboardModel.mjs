import pool from "../../utils/db.mjs";
import { months } from "../../utils/variables.mjs";
import {
  calculateTotalPremium,
  createNewArray,
  percentage,
} from "../../utils/commonFns.mjs";

const adminAnalytics = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const agentQuery =
        "(SELECT COUNT(*) FROM users WHERE role = 'agent' AND status = '1' AND registration = '2' AND is_deleted = 0) AS agentCount";
      const companyQuery =
        "(SELECT COUNT(*) FROM companies WHERE status = 1 AND is_deleted = 0) AS companyCount";
      const policyQuery =
        "(SELECT COUNT(*) FROM policies WHERE status = 1 AND is_deleted = 0)  AS policyCount";

      const [data] = await pool.query(
        `SELECT ${agentQuery}, ${companyQuery}, ${policyQuery}`
      );

      const [orders] = await pool.query("SELECT * FROM icm_orders");

      const {
        agentCount: agents,
        policyCount: policies,
        companyCount: companies,
      } = data[0];

      const totalPayments = orders.length;
      const donePayments = orders.filter((o) => o.status === "2");
      const pendingPayments = orders.filter((o) => o.status === "0");
      const rejectedPayments = orders.filter((o) => o.status === "1");
      const successful = percentage(donePayments.length, totalPayments);
      const pending = percentage(pendingPayments.length, totalPayments);
      const rejected = percentage(rejectedPayments.length, totalPayments);
      const premium = donePayments.reduce((acc, obj) => acc + obj.premium, 0);
      const orderResult = [successful, rejected, pending];

      const result = {
        premium,
        orderResult,
        agents,
        policies,
        companies,
      };

      resolve({ status: 200, data: result });
    } catch (er) {
      reject({ status: 500, message: "Something went wrong" });
    }
  });
};

const agentAnalytics = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { userId } = req.body;
      const { year } = req.query;

      const policyQuery = `SELECT COUNT(*) as policies FROM policies WHERE status = '1'`;
      const ordersQuery = `SELECT * FROM icm_orders WHERE agent_id = ${userId}`;
      const graphQuery = `SELECT * FROM icm_orders WHERE YEAR(updated_at) = ${year}  AND agent_id = ${userId}`;
      const clientsQuery = `SELECT COUNT(*) as clients FROM users WHERE created_by = ${userId} AND status = '1' AND role = 'user'`;

      const [totalPolices] = await pool.query(policyQuery);
      const [allOrders] = await pool.query(ordersQuery);
      const [totalClients] = await pool.query(clientsQuery);
      const [graphData] = await pool.query(graphQuery);

      const { policies } = totalPolices[0];
      const { clients } = totalClients[0];
      const allPaid = allOrders.filter((o) => o.status === "2");
      const allPending = allOrders.filter((o) => o.status === "0").length;
      const allPremiums = allPaid.reduce(
        (acc, order) => acc + order.premium,
        0
      );

      const totalOfYear = graphData.length;
      const paidOfYear = graphData.filter((o) => o.status === "2");
      const pendingOfYear = graphData.filter((o) => o.status === "0");
      const rejectedOfYear = graphData.filter((o) => o.status === "1");

      const getMonthAndPremium = paidOfYear.map((d) => ({
        premium: d.premium,
        month: new Date(d.updated_at).getMonth(),
      }));

      const totalPremiumByMonth = calculateTotalPremium(getMonthAndPremium);
      const sorted = totalPremiumByMonth.sort((a, b) => a.month - b.month);
      const premiumsArray = createNewArray(months, sorted);

      const pendingPercentage = percentage(pendingOfYear.length, totalOfYear);
      const rejectedPercentage = percentage(rejectedOfYear.length, totalOfYear);
      const paidPercentage = percentage(paidOfYear.length, totalOfYear);

      const paymentPercentage = {
        successfull: paidPercentage,
        rejected: rejectedPercentage,
        pending: pendingPercentage,
      };

      resolve({
        status: 200,
        data: {
          premiumsArray,
          paymentPercentage,
          monthsArray: months,
          totalClients: clients,
          totalPolices: policies,
          totalPremium: allPremiums,
          policyInvitaions: allPending,
        },
      });
    } catch (er) {
      reject({ status: 500, message: "Something went wrong" });
    }
  });
};

export { adminAnalytics, agentAnalytics };
