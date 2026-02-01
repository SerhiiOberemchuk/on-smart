export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
};
