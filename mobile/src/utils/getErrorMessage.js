export default function getErrorMessage(error) {
  const data = error.response?.data;

  if (data?.error) return data.error;
  if (data?.errors?.length) return data.errors[0].message;
  if (error.response) return "Something went wrong. Please try again.";

  return "Cannot reach the server. Check your connection.";
}