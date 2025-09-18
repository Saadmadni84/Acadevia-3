// app/your-page/page.tsx or pages/your-page.tsx

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function YourPage({ searchParams }: PageProps) {
  const phoneNumber = searchParams.phone as string;
  const userType = searchParams.type as string;
  
  console.log('Phone:', phoneNumber);
  console.log('Type:', userType);
  
  return (
    <div>
      <h1>Your Gamified Learning Page</h1>
      <p>Phone: {phoneNumber || 'Not provided'}</p>
      <p>User Type: {userType || 'Not specified'}</p>
    </div>
  );
}
