import moment from "moment-timezone";

const modifiedErrors = (errorsArray) => {
  const errorsObject = {};
  errorsArray.forEach((error) => {
    errorsObject[error.path] = error.msg;
  });
  return errorsObject;
};

const getFullName = (firstName, lastName) => `${firstName} ${lastName}`;

const registrationMail = (
  adminName,
  adminMail,
  agentName,
  agentEmail,
  time
) => {
  return {
    from: process.env.EMAIL,
    to: adminMail,
    subject: "Registration Form Submission - Account Approval Request",
    text: `Dear ${adminName},

    I trust this message finds you well. We wanted to inform you that a new registration has been submitted on our platform, and the user is seeking approval for their account.
    
    Details of the registration:
    
    User Name: ${agentName}
    Email Address: ${agentEmail}
    Registration Date: ${time}
    To review and take action on this registration, please log in to the admin dashboard.`,
  };
};

const rejectAgent = (agentName, agentEmail) => {
  return {
    from: process.env.EMAIL,
    to: agentEmail,
    subject: "Notification: Registration Rejection - TQM Insurance",
    text: `Dear ${agentName},

We hope this email finds you well. Thank you for your interest in joining TQM Insurance as an agent.

After careful consideration, we regret to inform you that your registration has been rejected by our administrative team. We appreciate the time and effort you invested in the registration process.

If you believe there has been an error or if you have addressed the concerns mentioned above, please feel free to reach out to our support team at support@tqminsurance.com We would be happy to assist you in resolving any issues and reconsidering your application.

We value your interest in TQM Insurance and encourage you to explore other opportunities that may arise in the future. Thank you for considering us as your platform of choice.`,
  };
};

const acceptAgent = (agentName, agentEmail) => {
  return {
    from: process.env.EMAIL,
    to: agentEmail,
    subject:
      "Congratulations! Your Registration with TQM Insurance is Approved!",
    text: `Dear ${agentName},
    
    We are delighted to inform you that your registration with TQM Insurance has been accepted! Welcome to our community of dedicated agents.

    Your enthusiasm and qualifications stood out, and we are confident that you will contribute significantly to our platform. We look forward to a successful and mutually beneficial partnership.

    If you have any questions or need assistance as you get started, feel free to reach out to our support team at support@tqminsurance.com

    Wishing you all the best on your journey with TQM Insurance 

Warm regards,

TQM Insurance - Manager,
+91 999-***-****
    `,
  };
};

const invitationEmail = (agentEmail, verificationLink) => {
  return {
    from: process.env.EMAIL,
    to: agentEmail,
    subject: "Invitation to Register as an Agent for TQM Insurance",
    text: `Dear,
    
We are thrilled to extend this invitation for you to join the TQM Insurance team as an agent!

At TQM Insurance, we value our agents as integral partners in delivering exceptional service to our clients. By registering as an agent, you'll have access to exclusive resources and tools to help you succeed in your role.

To complete your registration as an agent, please click on the link below within the hour:

${verificationLink}

Thank you for considering TQM Insurance as your partner. We are excited to welcome you to our team and look forward to working together to provide top-notch insurance solutions to our clients.

Best regards,
Manager,
TQM Insurance Team`,
  };
};

const policyPurchaseEmail = (
  userEmail,
  userName,
  policyName,
  provider,
  premium,
  expiry,
  agentName,
  agentEmail,
  contactNumber
) => {
  return {
    from: process.env.EMAIL,
    to: userEmail,
    subject: "Confirmation of Insurance Policy Purchase from TQM Insurance",
    text: `Dear ${userName},

    We hope this email finds you well.
    
    We are writing to confirm your recent purchase of an insurance policy through TQM Insurance. Your decision to trust us with your insurance needs is greatly appreciated, and we are committed to providing you with the best service possible.
    
    Below are the details of your insurance policy:
    
    Policy Name: ${policyName}
    Insurance Policy Company: ${provider}
    Policy Premium: ₹ ${premium}
    Valid Till Date: ${expiry}

    Additionally, we would like to introduce you to your dedicated agent who will assist you throughout your policy term:
    
    Agent Name: ${agentName}
    Agent Email: ${agentEmail}
    Agent Contact Number: +91 ${contactNumber}
    
    Your agent is available to address any questions or concerns you may have regarding your policy or any other insurance-related matters. Feel free to reach out to them at any time.
    
    Once again, thank you for choosing TQM Insurance. We value your trust and look forward to serving you.
    
    Best regards,
    Manager
    TQM Insurance`,
  };
};

const currentIST = () => {
  const currentDate = new Date();
  const istOptions = { timeZone: "Asia/Kolkata" };
  const istTime = currentDate.toLocaleString("en-US", istOptions);
  return istTime;
};

const makePaymentEmail = (
  contactEmail,
  contactName,
  policyNumber,
  premium,
  link
) => {
  return {
    from: "budhdevtqm@gmail.com",
    to: contactEmail,
    subject: "Payment Required for Purchasing Insurance Policy",
    text: `Dear ${contactName},
    
    I hope this email finds you well.

We're reaching out to remind you about the pending payment required for your insurance policy with TQM Insurance. Your insurance coverage is crucial for your protection and peace of mind.

Details of the pending payment:

Policy Number: ${policyNumber}
Premium Amount: ₹ ${premium}

To complete the payment process, kindly make the necessary arrangements at your earliest convenience by visiting our secure payment page here.

${link}

Please ensure the payment is made by the due date to avoid any disruption to your insurance coverage.

After successful payment, you will receive an email with the detailed information regarding your policy.

If you have any questions or need assistance regarding your payment, please feel free to contact our customer service team at +91 9*********0 or email us at customerservice@tqminsurance.com.

Thank you for choosing TQM Insurance. We appreciate your prompt attention to this matter.

Best regards,

Manager
TQM Insurance
    `,
  };
};

const userStatus = (status) => {
  const statusMap = {
    accepted: 2,
    rejected: 1,
    pending: 0,
  };

  return statusMap[status];
};

const addMonthsToCurrentDate = (monthsToAdd) => {
  const currentDate = moment();
  const nextDate = currentDate.add(monthsToAdd, "months");
  const nextDateIST = nextDate.tz("Asia/Kolkata");
  return nextDateIST.format("DD MMMM YYYY");
};

const percentage = (count, totalCount) => {
  const divide = count / totalCount;
  const percent = divide * 100;
  return Number(percent.toFixed(1));
};

const modifyPaymentStatus = (str) => {
  let status = "";
  if (str === "paid") {
    status = "2";
  } else if (str === "rejected") {
    status = "1";
  } else {
    status = "0";
  }
  return status;
};

const createNewArray = (monthsArr, dataArr) => {
  let newArr = new Array(monthsArr.length);
  for (let i = 0; i < newArr.length; i++) {
    const data = dataArr.filter((d) => d.month === i);
    if (data.length === 0) {
      newArr[i] = 0;
    } else {
      const { premium } = data[0];
      newArr[i] = premium;
    }
  }
  return newArr;
};

const getPreviousMonthNames = (lastMonth) => {
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

  return months.slice(0, lastMonth + 1);
};
const calculateTotalPremium = (data) => {
  const monthlyPremium = {};

  data.forEach((item) => {
    const { month, premium } = item;
    if (monthlyPremium[month] !== undefined) {
      monthlyPremium[month] += premium;
    } else {
      monthlyPremium[month] = premium;
    }
  });

  return Object.keys(monthlyPremium).map((month) => ({
    month: parseInt(month),
    premium: monthlyPremium[month],
  }));
};

export {
  userStatus,
  percentage,
  getFullName,
  currentIST,
  rejectAgent,
  acceptAgent,
  createNewArray,
  modifiedErrors,
  invitationEmail,
  makePaymentEmail,
  registrationMail,
  modifyPaymentStatus,
  policyPurchaseEmail,
  getPreviousMonthNames,
  calculateTotalPremium,
  addMonthsToCurrentDate,
};
