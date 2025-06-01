import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Loader, Pencil, Trash2, FileText, BookOpen, Wrench } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getDestinationsWithPagination, Destination, addDestination, updateDestination, deleteDestination } from '@/services/Listings/Destinations';
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

const DestinationsPage = () => {
  const [Destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  // State to toggle between card and list view
  const [isCardView, setIsCardView] = useState(true);
  const [currentDestinations, setCurrentDestinations] = useState<Destination | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [destinationsToDelete, setDestinationsToDelete] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0,
  });

  useEffect(() => {
    fetchDestinations(pagination.page, pagination.limit);
  }, []);


  const fetchDestinations = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      const {destinations,pagination} = await getDestinationsWithPagination(page,limit);
      setDestinations(destinations || []);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
        totalRecords: pagination.totalRecords,
      })
    } catch (error) {
      console.error('Error fetching Destinations:', error);
      toast.error('Failed to load Destinations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd =  () => {
    setCurrentDestinations(null);
    setFormOpen(true);
  };

  const handleEdit = (id: number) => {
    const destination = Destinations.find((g) => g.id === id);
    console.log('Editing destination:', destination);
    if (destination) {
      setCurrentDestinations(() => destination);
      setFormOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setDestinationsToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdate = async (values) => {
    if (!currentDestinations) return;
    
    try {
      setIsProcessing(true);
      const response = await updateDestination(currentDestinations.id, {
        ...values
      });

      fetchDestinations(pagination.page,pagination.limit)
      setFormOpen(false);
      toast.success('Destinations updated successfully');
    } catch (error) {
      console.error('Error updating Destinations:', error);
      toast.error('Failed to update Destinations');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!destinationsToDelete) return;

    try {
      setIsProcessing(true);
      await deleteDestination(destinationsToDelete);
      fetchDestinations(pagination.page,pagination.limit)
      toast.success('Destinations deleted successfully');
    } catch (error) {
      console.error('Error deleting Destinations:', error);
      toast.error('Failed to delete Destinations');
    } finally {
      setIsProcessing(false);
        setIsDeleteDialogOpen(false);
        setDestinationsToDelete(null);
    }
  };

const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchDestinations(newPage, pagination.limit);
  };
  const additionalFields = [
    {name:"name", label:"Name", type:"text", placeholder:"Enter Destinations name", required:true},
    {name:"published", label:"Published", type:"switch", placeholder:"Enter Destinations content",required:false},
    {name:"region", label:"Region", type:"text", placeholder:"Enter Destinations region",required:true},
    {name:"description",label:"Description",type:"textarea",required:true},
    {name:"country", label:"Country", type:"text", placeholder:"Enter Destinations country",required:true},
    {name:"image", label:"Image URL", type:"file", placeholder:"https://example.com/image.jpg",required:false},
  ]

  const handleFormSubmit = async (values) => {
    try{
        const newDestinations = await addDestination(values);
        fetchDestinations(pagination.page,pagination.limit)
        setFormOpen(false);
        toast.success('Destinations added successfully');
    } catch (error) {
        console.error('Error adding Destinations:', error);
        toast.error('Failed to add Destinations');
        throw error;
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Travel Destinations</h1>
          <p className="text-muted-foreground mt-1">
            Manage Destinations of and for travelers
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-travel-600 hover:bg-travel-700"
          onClick={handleAdd}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Destinations
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
      
      {/* End of toggle  */}
      </div>
      
      <Separator className="my-6" />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-travel-600" />
        </div>
      ) : Destinations.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold mb-2">No Destinations found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first travel Destinations
          </p>
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Destinations
          </Button>
        </div>
      ) : isCardView ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Destinations.map((destination) => (
            <ListingCard
              key={destination.id}
              id={destination.id}
              title={destination.name}
              description={`At ${destination.country} in ${destination.region} State`}
              badges={[ destination.published == "1" ? "Published" : "Unpublished"]}
              image={destination.image_url || "https://via.placeholder.com/150"}
              price={ 0} // Provide a default price if not available
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Destinations.map((destination) => (
                        <TableRow key={destination.id}>
                            <TableCell className="font-medium">{destination.name}</TableCell>
                            <TableCell>{destination.region}</TableCell>
                            <TableCell>{destination.country}</TableCell>
                            <TableCell>{getStatusBadge(destination.published)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEdit.bind(null, destination.id)}
                                        className="bg-travel-100 text-travel-800 border-travel-200 hover:bg-travel-200"
                                    >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDelete.bind(null, destination.id)}
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
      {/* Pagination */}
        <Pagination className="mt-6">
          {Destinations.length > 0 && (
            <div className="text-sm text-muted-foreground mb-2">
              Showing page {pagination.page} of {pagination.totalPages}
            </div>
          )}
          <PaginationContent>
            <PaginationPrevious
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            />
            {[...Array(pagination.totalPages)].map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink
                  isActive={pagination.page === idx + 1}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            />
          </PaginationContent>
        </Pagination>
      {/* Add Destinations Dialog */}
      {!currentDestinations && (
        <ListingForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title="Add New Destinations"
          fields={additionalFields}
          initialValues={{ name: '', region: '', country: '', image: '', published: false }}
          onSubmit={handleFormSubmit}
        />
      )}
    
      {/* Edit Destinations Dialog */}
      {currentDestinations && (
        <ListingForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={`Update Destinations: ${currentDestinations.name}`}
          fields={additionalFields}
          initialValues={currentDestinations ? { ...currentDestinations } : {}}
          onSubmit={handleUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Destinations"
        description={`Are you sure you want to delete the destination? This action cannot be undone.`}
        isDeleting={isProcessing}
      />
    </>
  );
};

export default DestinationsPage;
