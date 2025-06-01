
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Lead, LeadReply, getLeads, addLeadReply } from '@/services/dataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader, Search, MessageSquare, Mail, Divide } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { getFlights, Flight, addFlight, updateFlight, deleteFlight } from '@/services/dataService';
 import ListingCard from '@/components/ListingCard'; // Assuming you have a ListingCard component for card view
 import { ListingForm } from '@/components/forms/ListingForm';
 import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog'; 
 import { PlusCircle} from 'lucide-react';

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openBulkEmailDialog, setOpenBulkEmailDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State to toggle between card and list view
  const [isCardView, setIsCardView] = useState(true);
  const [flights, setFlights] = useState<Flight[]>([]);
   const [formOpen, setFormOpen] = useState(false);
  const [currentFlight, setCurrentFlight] = useState<Flight | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState<number | null>(null);




    const fetchFlights = async () => {
    setIsLoading(true);
    try {
      const data = await getFlights();
      setFlights(data);
    } catch (error) {
      console.error('Error fetching flights:', error);
      toast.error('Failed to load flights');
    } finally {
      setIsLoading(false);
    }
  };
   
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ message: string; subject?: string }>();

  useEffect(() => {
    fetchFlights();
    fetchLeads();
  }, []);



  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLeads(leads);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredLeads(
        leads.filter(
          (lead) =>
            lead.name.toLowerCase().includes(query) ||
            lead.email.toLowerCase().includes(query) ||
            lead.interest.toLowerCase().includes(query) ||
            lead.status.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, leads]);

const handleAdd = () => {
    setCurrentFlight(null);
    setFormOpen(true);
  };


   const handleEdit = (id: number) => {
    const flight = flights.find(f => f.id === id);
    if (flight) {
      setCurrentFlight(flight);
      setFormOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setFlightToDelete(id);
    setIsDeleteDialogOpen(true);
  };




const handleFormSubmit = async (values: ListingFormValues) => {
    try {
      if (currentFlight) {
        // Update existing flight
        const updatedFlight = await updateFlight({
          ...values,
          id: currentFlight.id
        });
        setFlights(flights.map(f => f.id === currentFlight.id ? updatedFlight : f));
      } else {
        // Add new flight
        const newFlight = await addFlight(values);
        setFlights([...flights, newFlight]);
      }
      return true;
    } catch (error) {
      console.error('Error saving flight:', error);
      throw error;
    }
  };


   const confirmDelete = async () => {
    if (flightToDelete === null) return;
    
    try {
      await deleteFlight(flightToDelete);
      setFlights(flights.filter(f => f.id !== flightToDelete));
      toast.success('Flight deleted successfully');
    } catch (error) {
      console.error('Error deleting flight:', error);
      toast.error('Failed to delete flight');
    } finally {
      setIsDeleteDialogOpen(false);
      setFlightToDelete(null);
    }
  };



  const additionalFields = [
    { name: 'airline', label: 'Airline', type: 'text', required: true },
    { name: 'flight_number', label: 'Flight Number', type: 'text', required: true },
    { name: 'departure_city', label: 'Departure City', type: 'text', required: true },
    { name: 'arrival_city', label: 'Arrival City', type: 'text', required: true },
    { name: 'departure_time', label: 'Departure Time (YYYY-MM-DD HH:MM)', type: 'text', required: true },
    { name: 'arrival_time', label: 'Arrival Time (YYYY-MM-DD HH:MM)', type: 'text', required: true },
  ];


  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const data = await getLeads();
      setLeads(data);
      setFilteredLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const openDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setOpenDetailsDialog(true);
  };

  const openEmail = (lead: Lead) => {
    setSelectedLead(lead);
    setOpenEmailDialog(true);
  };

  const onMessageSubmit = async (data: { message: string; subject?: string }) => {
    if (!selectedLead) return;
    
    try {
      setIsSubmitting(true);
      const reply = await addLeadReply(selectedLead.id, data.message);
      
      // Update leads state
      const updatedLeads = leads.map(lead => {
        if (lead.id === selectedLead.id) {
          const updatedReplies = [...(lead.replies || []), reply];
          return { ...lead, replies: updatedReplies };
        }
        return lead;
      });
      
      setLeads(updatedLeads);
      setFilteredLeads(updatedLeads);
      
      // Update the selected lead
      if (selectedLead) {
        const updatedReplies = [...(selectedLead.replies || []), reply];
        setSelectedLead({ ...selectedLead, replies: updatedReplies });
      }
      
      reset();
      setOpenEmailDialog(false);
      toast.success('Response sent successfully');
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBulkEmailSubmit = async (data: { message: string; subject: string }) => {
    try {
      setIsSubmitting(true);
      
      // In a real implementation, this would send to all leads
      // but for mock purposes, we'll just show a success message
      
      setTimeout(() => {
        setOpenBulkEmailDialog(false);
        reset();
        toast.success(`Email sent to ${filteredLeads.length} leads`);
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending bulk email:', error);
      toast.error('Failed to send bulk email');
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>;
      case 'contacted':
        return <Badge className="bg-yellow-500">Contacted</Badge>;
      case 'qualified':
        return <Badge className="bg-green-500">Qualified</Badge>;
      case 'converted':
        return <Badge className="bg-travel-600">Converted</Badge>;
      case 'lost':
        return <Badge className="bg-gray-500">Lost</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Manage potential customer inquiries and opt-ins
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search leads..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="bg-travel-600 hover:bg-travel-700"
            onClick={() => setOpenBulkEmailDialog(true)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Email All
          </Button>
        </div>
       
      </div>
      {/* Toggle between listings */}
      <div className='w-full flex justify-end mb-4'>
        <div className="mb-6 flex items-center space-x-4">
        {/* <span className="text-gray-700 font-medium">View:</span> */}
        <button
          onClick={() => setIsCardView(!isCardView)}
          className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 focus:outline-none ${
            isCardView ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow-md transform transition duration-300 ${
              isCardView ? "translate-x-6" : ""
            }`}
          ></div>
        </button>
        <span className="text-sm text-gray-500">
          {/* {isCardView ? "Card View" : "List "} */}
        </span>
      </div>
      </div>
      
      {/* End of toggle  */}
      
      
      
      <Separator className="my-6" />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-travel-600" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold mb-2">No leads found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search query.' : 'There are no leads in the system yet.'}
          </p>
        </div>
      ) : isCardView ? (
        <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flights</h1>
          <p className="text-muted-foreground mt-1">
            Manage your flight listings
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-travel-600 hover:bg-travel-700"
          onClick={handleAdd}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Flight
        </Button>
      </div>
      <div className="listing-grid">
        
        {
          flights.map((flight)=> (
            <ListingCard
            key={flight.id}
              id={flight.id}
              title={`${flight.airline} ${flight.flight_number}`}
              image={flight.image_url}
              description={`Flight from ${flight.departure_city} to ${flight.arrival_city}`}
              price={flight.price}
              priceLabel="per seat"
              badges={[flight.airline]}
              details={{
                'Departure': new Date(flight.departure_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }),
                'Arrival': new Date(flight.arrival_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }),
                'Date': new Date(flight.departure_time).toLocaleDateString()
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              
            />

            
          ))
        }
        <ListingForm 
                open={formOpen}
                onOpenChange={setFormOpen}
                onSubmit={handleFormSubmit}
                title={currentFlight ? "Edit Flight" : "Add New Flight"}
                initialValues={currentFlight || []}
                fields={additionalFields}
              />
        
              <DeleteConfirmationDialog 
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete Flight"
                description="Are you sure you want to delete this flight? This action cannot be undone."
              />
      </div></>): (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone || 'N/A'}</TableCell>
                  <TableCell>{lead.interest}</TableCell>
                  <TableCell>{formatDate(lead.created_at)}</TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetails(lead)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEmail(lead)}
                        className="bg-travel-100 text-travel-800 border-travel-200 hover:bg-travel-200"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Lead Details Dialog */}
      {selectedLead && (
        <Dialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Name</h4>
                <p className="font-medium">{selectedLead.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                <p className="font-medium">{selectedLead.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                <p className="font-medium">{selectedLead.phone || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Interest</h4>
                <p className="font-medium">{selectedLead.interest}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Date</h4>
                <p className="font-medium">{formatDate(selectedLead.created_at)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                <div>{getStatusBadge(selectedLead.status)}</div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Message</h4>
              <Card>
                <CardContent className="p-4">
                  {selectedLead.message}
                </CardContent>
              </Card>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Communication History</h3>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto p-2 border rounded-lg">
                {selectedLead.replies && selectedLead.replies.length > 0 ? (
                  selectedLead.replies.map((reply, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-blue-50 border border-blue-100"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Response</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(reply.created_at), 'PPp')}
                        </span>
                      </div>
                      <p className="text-sm">{reply.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground p-4">No communication history</p>
                )}
              </div>
              
              <form onSubmit={handleSubmit(onMessageSubmit)} className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Type your response here..."
                    className="min-h-[100px]"
                    {...register('message', { required: 'Message is required' })}
                  />
                  {errors.message && (
                    <p className="text-destructive text-sm mt-1">{errors.message.message}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-travel-600 hover:bg-travel-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Response'}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Email Dialog */}
      {selectedLead && (
        <Dialog open={openEmailDialog} onOpenChange={setOpenEmailDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Send Email to {selectedLead.name}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onMessageSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">To</label>
                <Input value={selectedLead.email} disabled />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Subject</label>
                <Input 
                  placeholder="Email subject"
                  {...register('subject', { required: 'Subject is required' })}
                />
                {errors.subject && (
                  <p className="text-destructive text-sm mt-1">{errors.subject.message}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Message</label>
                <Textarea
                  placeholder="Type your email message here..."
                  className="min-h-[200px]"
                  {...register('message', { required: 'Message is required' })}
                />
                {errors.message && (
                  <p className="text-destructive text-sm mt-1">{errors.message.message}</p>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setOpenEmailDialog(false)}
                  className="mt-2 sm:mt-0"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-travel-600 hover:bg-travel-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Email'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Email Dialog */}
      <Dialog open={openBulkEmailDialog} onOpenChange={setOpenBulkEmailDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Send Email to All Leads</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onBulkEmailSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Recipients</label>
              <Input value={`${filteredLeads.length} leads selected`} disabled />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <Input 
                placeholder="Email subject"
                {...register('subject', { required: 'Subject is required' })}
              />
              {errors.subject && (
                <p className="text-destructive text-sm mt-1">{errors.subject.message}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Message</label>
              <Textarea
                placeholder="Type your email message here..."
                className="min-h-[200px]"
                {...register('message', { required: 'Message is required' })}
              />
              {errors.message && (
                <p className="text-destructive text-sm mt-1">{errors.message.message}</p>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setOpenBulkEmailDialog(false)}
                className="mt-2 sm:mt-0"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-travel-600 hover:bg-travel-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send to All'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeadsPage;
