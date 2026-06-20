import { Box, Typography } from '@mui/material';
import { SchoolRounded } from '@mui/icons-material';

const STATS = [
  { value: '5,000+', label: 'Students' },
  { value: '200+',   label: 'Resources' },
  { value: '20+',    label: 'Departments' },
];

export default function AuthLayout({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(145deg,#EFF4FF 0%,#F0F4FF 50%,#E8F0FE 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative blobs */}
      <Box sx={{ position:'absolute', top:-120, right:-120, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(21,101,192,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
      <Box sx={{ position:'absolute', bottom:-180, left:-120, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,151,167,0.05) 0%,transparent 70%)', pointerEvents:'none' }} />

      {/* Left brand panel – desktop only */}
      <Box sx={{ display:{ xs:'none', md:'flex' }, flex:1, flexDirection:'column', justifyContent:'center', px:{ md:8, lg:12 }, py:6 }}>
        {/* Logo */}
        <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:7 }}>
          <Box sx={{ width:52, height:52, borderRadius:3, background:'linear-gradient(135deg,#1565C0,#0D47A1)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(21,101,192,0.3)' }}>
            <SchoolRounded sx={{ color:'white', fontSize:28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight:800, color:'primary.main', lineHeight:1.1 }}>SmartCampus</Typography>
            <Typography variant="caption" sx={{ color:'text.secondary', fontSize:'0.72rem' }}>Resource & Lab Booking Portal</Typography>
          </Box>
        </Box>

        <Typography variant="h2" sx={{ fontWeight:800, color:'#0D1B2A', fontSize:{ md:'2.8rem', lg:'3.4rem' }, lineHeight:1.15, mb:3 }}>
          Book resources.<br/>
          <Box component="span" sx={{ color:'primary.main' }}>Stay organized.</Box>
        </Typography>

        <Typography variant="body1" sx={{ color:'text.secondary', maxWidth:420, lineHeight:1.85, mb:6 }}>
          A centralized platform for students, faculty, HODs, and administrators to manage
          lab bookings, resource allocation, and departmental operations with ease.
        </Typography>

        <Box sx={{ display:'flex', gap:4 }}>
          {STATS.map((s) => (
            <Box key={s.label}>
              <Typography variant="h5" sx={{ fontWeight:800, color:'primary.main' }}>{s.value}</Typography>
              <Typography variant="caption" sx={{ color:'text.secondary' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right form panel */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', flex:{ xs:1, md:'none' }, width:{ xs:'100%', md:'500px', lg:'540px' }, p:{ xs:2, sm:4 }, overflowY:'auto' }}>
        {children}
      </Box>
    </Box>
  );
}
