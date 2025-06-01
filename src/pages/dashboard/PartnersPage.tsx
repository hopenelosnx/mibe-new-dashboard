import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Loader, Pencil, Trash2, FileText, BookOpen, Wrench } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getAllPartners, Partner, addPartner, updatePartner, deletePartner } from '@/services/dataService';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListingForm } from '@/components/forms/ListingForm';
import ListingCard from '@/components/ListingCard';
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import getStatusBadge from '@/components/ui/CustomBadges';

const PartnersPage = () => {
  const [Partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  // State to toggle between card and list view
  const [isCardView, setIsCardView] = useState(true);
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [PartnersToDelete, setPartnersToDelete] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0,
  });

  useEffect(() => {
    fetchPartners(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);


  const fetchPartners = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      const data = await getAllPartners();
      setPartners(data);
    } catch (error) {
      console.error('Error fetching Partners:', error);
      toast.error('Failed to load Partners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd =  () => {
    setCurrentPartner(null);
    setFormOpen(true);
  };

  const handleEdit = (id: number) => {
    const Partner = Partners.find((g) => g.id === id);
    console.log('Editing Partner:', Partner);
    if (Partner) {
      setCurrentPartner(() => Partner);
      setFormOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setPartnersToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdate = async (values) => {
    if (!currentPartner) return;
    
    try {
      setIsProcessing(true);
      const response = await updatePartner(currentPartner.id, {
        ...values
      });

      setPartners(Partners.map(r => r.id === currentPartner.id ? { ...r, ...response } : r));
      setFormOpen(false);
      toast.success('Partners updated successfully');
    } catch (error) {
      console.error('Error updating Partners:', error);
      toast.error('Failed to update Partners');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!PartnersToDelete) return;

    try {
      setIsProcessing(true);
      await deletePartner(PartnersToDelete);
      setPartners(Partners.filter(r => r.id !== PartnersToDelete));
      toast.success('Partners deleted successfully');
    } catch (error) {
      console.error('Error deleting Partners:', error);
      toast.error('Failed to delete Partners');
    } finally {
      setIsProcessing(false);
        setIsDeleteDialogOpen(false);
        setPartnersToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchPartners(newPage, pagination.limit);
  };

  const handleFormSubmit = async (values) => {
    try{
        const newPartners: Partner = await addPartner(values);
        setPartners([...Partners, newPartners]);
        setFormOpen(false);
        toast.success('Partners added successfully');
    } catch (error) {
        console.error('Error adding Partners:', error);
        toast.error('Failed to add Partners');
        throw error;
    }
  };
  
  const additionalFields = [
    {name:"name", label:"Name", type:"text", placeholder:"Enter Partner name"},
    {name:"published", label:"Published", type:"switch", placeholder:"Is this Partner published?"},
    {name:"description", label:"Description", type:"textarea", placeholder:"Enter Partner description"},
    {name:"website_url", label:"Website URL", type:"text", placeholder:"https://example.com"},
    {name:"logo_url", label:"Logo URL", type:"text", placeholder:"https://example.com/logo.png"},
    {name:"partnership_type", label:"Partnership Type", type:"text", placeholder:"E.g., Hotel Chain, Airline, Tourism Board"},
  ]
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trusted Partners</h1>
          <p className="text-muted-foreground mt-1">
            Manage your trusted business partners
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-travel-600 hover:bg-travel-700"
          onClick={handleAdd}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Partner
        </Button>
        
        {/* Toggle between listings */}
        <div className='flex justify-end'>
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
        </div>
      </div>
      
      <Separator className="my-6" />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-travel-600" />
        </div>
      ) : Partners.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold mb-2">No partners found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first business partner
          </p>
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Partner
          </Button>
        </div>
      ) : isCardView ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Partners.map((partner) => (
            <ListingCard
              key={partner.id}
              id={partner.id}
              title={partner.name}
              description={partner.description}
              image={partner.logo_url}
              badges={[partner.partnership_type, partner.published === "1"? 'Published' : 'Unpublished']}
              onEdit={() => handleEdit(partner.id)}
              onDelete={() => handleDelete(partner.id)}
              price={null}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Published</TableHead>
                        <TableHead className="text-right">Partner Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Partners.map((partner) => (
                        <TableRow key={partner.id}>
                            <TableCell className="font-medium">{partner.name}</TableCell>
                            <TableCell>{partner.description.slice(0,20)}...</TableCell>
                            <TableCell className="text-right">{getStatusBadge(partner.published)}</TableCell>
                            <TableCell className="text-right">
                                <Badge className="bg-travel-100 text-travel-800 border-travel-200">
                                    {partner.partnership_type || 'N/A'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEdit.bind(null, partner.id)}
                                        className="bg-travel-100 text-travel-800 border-travel-200 hover:bg-travel-200"
                                    >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDelete.bind(null, partner.id)}
                                        className="bg-red-100 text-red-800 border-travel-200 hover:bg-red-200"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )}

      {/* Add Partner Dialog */}
      {!currentPartner && (
        <ListingForm
          open={formOpen}
          title="Add New Partner"
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
          initialValues={currentPartner || {}}
          fields={additionalFields}
        />
      )}

      {/* Edit Partner Dialog */}
      {currentPartner && (
        <ListingForm
          open={formOpen}
          title={`Edit Partner: ${currentPartner.name}`}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
          initialValues={currentPartner}
          fields={additionalFields}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Partner"
        description={`Are you sure you want to delete the partner? This action cannot be undone.`}
        isDeleting={isProcessing}
      />
    </>
  );
};

export default PartnersPage;
