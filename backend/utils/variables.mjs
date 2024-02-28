import mailer from "nodemailer";

const mailTransporter = mailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const pagination = (pageNo) => {
  const lastIndex = pageNo * 10;
  const startIndex = lastIndex - 10;
  return { lastIndex, startIndex };
};

const stripeKey =
  "sk_test_51Ni8QKSCTH8hN1Ap1a7Rg359ifaiaxOKkIZdbii24aCuVBjFxTTjdNqF2Aec1ENZcdYvyrW6tZKkRTZSGE7J93Do00jEKfFbSz";

export { months, stripeKey, mailTransporter, pagination };
