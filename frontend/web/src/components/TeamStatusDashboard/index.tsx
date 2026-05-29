import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  Divider, 
  List, 
  ListItem,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Badge,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TeamMemberStatus from '../TeamMemberStatus';
import { UserStatus } from '../../contexts/UserStatusContext';

export interface TeamMember {
  id: string;
  name: string;
  status: UserStatus;
  avatar: string;
  department: string;
  lastActiveTime: Date;
}

interface TeamStatusDashboardProps {
  title?: string;
}

const TeamStatusDashboard: React.FC<TeamStatusDashboardProps> = ({ 
  title = 'Team Status' 
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    setTeamMembers([]);
    setFilteredMembers([]);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const departments = [...new Set(teamMembers.map(member => member.department))];
  
  // Filter based on search, tab, and department
  useEffect(() => {
    let result = [...teamMembers];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply tab filter
    if (selectedTab === 1) { // Online (available, busy, away, in meeting)
      result = result.filter(member => 
        ['available', 'busy', 'away', 'inMeeting'].includes(member.status)
      );
    } else if (selectedTab === 2) { // Unavailable (offline, do not disturb)
      result = result.filter(member => 
        ['offline', 'doNotDisturb'].includes(member.status)
      );
    }
    
    // Apply department filter
    if (selectedDepartment) {
      result = result.filter(member => member.department === selectedDepartment);
    }
    
    setFilteredMembers(result);
  }, [teamMembers, searchQuery, selectedTab, selectedDepartment]);

  // Calculate status counts for badges
  const onlineCount = teamMembers.filter(m => 
    ['available', 'busy', 'away', 'inMeeting'].includes(m.status)
  ).length;
  
  const unavailableCount = teamMembers.filter(m => 
    ['offline', 'doNotDisturb'].includes(m.status)
  ).length;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleDepartmentSelect = (department: string | null) => {
    setSelectedDepartment(department);
    handleFilterClose();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader 
        title={
          <Typography variant="h6" fontWeight="medium">
            {title}
          </Typography>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
      />
      
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search team members..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={handleFilterClick}
                  aria-label="filter"
                >
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={() => handleDepartmentSelect(null)}>
            All Departments
          </MenuItem>
          <Divider />
          {departments.map(dept => (
            <MenuItem 
              key={dept} 
              onClick={() => handleDepartmentSelect(dept)}
              selected={selectedDepartment === dept}
            >
              {dept}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      
      <Box sx={{ px: 2 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab 
            label="All" 
            icon={<Chip 
              size="small" 
              label={teamMembers.length} 
            />} 
            iconPosition="end"
          />
          <Tab 
            label="Online" 
            icon={<Chip 
              size="small" 
              label={onlineCount} 
              color="success" 
            />} 
            iconPosition="end"
          />
          <Tab 
            label="Unavailable" 
            icon={<Chip 
              size="small" 
              label={unavailableCount} 
              color="default" 
            />} 
            iconPosition="end"
          />
        </Tabs>
      </Box>
      
      <Divider />
      
      <CardContent sx={{ px: 0, py: 0, flex: 1, overflow: 'auto' }}>
        {filteredMembers.length > 0 ? (
          <List disablePadding>
            {filteredMembers.map((member, index) => (
              <React.Fragment key={member.id}>
                <ListItem sx={{ px: 2, py: 1.5 }}>
                  <TeamMemberStatus
                    status={member.status}
                    name={member.name}
                    avatar={member.avatar}
                    lastActiveTime={member.lastActiveTime}
                    size="medium"
                    showLastActive={true}
                  />
                </ListItem>
                {index < filteredMembers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No team members found matching your criteria
            </Typography>
          </Box>
        )}
      </CardContent>
      
      {selectedDepartment && (
        <Box sx={{ p: 1.5, bgcolor: 'background.default' }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Typography variant="body2" color="text.secondary">
              Filtered by:
            </Typography>
            <Chip 
              label={selectedDepartment}
              size="small"
              onDelete={() => setSelectedDepartment(null)}
            />
          </Stack>
        </Box>
      )}
    </Card>
  );
};

export default TeamStatusDashboard; 