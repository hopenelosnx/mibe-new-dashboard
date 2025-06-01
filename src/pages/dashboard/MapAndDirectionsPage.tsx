import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Loader, Pencil, Trash2, FileText, BookOpen, Wrench } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getTravelResources, TravelResource, addResource, updateResource, deleteResource } from '@/services/dataService';
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

const MapAndDirectionsPage = () => {
  const [Maps, setMaps] = useState<TravelResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  // State to toggle between card and list view
  const [isCardView, setIsCardView] = useState(true);
  const [currentMaps, setCurrentMaps] = useState<TravelResource | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [MapsToDelete, setMapsToDelete] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0,
  });
  const formatDate = (date: string | Date): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
    };

  useEffect(() => {
    fetchMaps(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);


  const fetchMaps = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      const data = await getTravelResources();
    //   setPagination({
    //     page: data.page,
    //     limit: data.limit,
    //     totalPages: data.totalPages,
    //     totalRecords: data.totalRecords
    //   });
      const Maps = data.filter((resource) => resource.type === "map");
      setMaps(Maps);
    } catch (error) {
      console.error('Error fetching Maps:', error);
      toast.error('Failed to load Maps');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    setCurrentMaps(null);
    setFormOpen(true);
  };

  const handleEdit = (id: number) => {
    const map = Maps.find((g) => g.id === id);
    if (map) {
      setCurrentMaps(map);
      setFormOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setMapsToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdate = async (values) => {
    if (!currentMaps) return;
    
    try {
      setIsProcessing(true);
      const response = await updateResource(currentMaps.id, {
        ...values
      });

      setMaps(Maps.map(r => r.id === currentMaps.id ? response : r));
      setFormOpen(false);
      toast.success('Maps updated successfully');
    } catch (error) {
      console.error('Error updating Maps:', error);
      toast.error('Failed to update Maps');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!MapsToDelete) return;

    try {
      setIsProcessing(true);
      await deleteResource(MapsToDelete);
      setMaps(Maps.filter(r => r.id !== MapsToDelete));
      toast.success('Maps deleted successfully');
    } catch (error) {
      console.error('Error deleting Maps:', error);
      toast.error('Failed to delete Maps');
    } finally {
      setIsProcessing(false);
        setIsDeleteDialogOpen(false);
        setMapsToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
          switch (status) {
          case '1':
              return <Badge className="bg-blue-500">Published</Badge>;
          case '0':
              return <Badge className="bg-yellow-500">Unpublished</Badge>;
          default:
              return <Badge>{status}</Badge>;
          }
      };
  const additionalFields = [
    {name:"title", label:"Title", type:"text", placeholder:"Enter Maps title", required:true},
    {name:"published", label:"Published", type:"switch", placeholder:"Enter Maps content",required:false},
    {name:"description", label:"Description", type:"textarea", placeholder:"Enter Maps description",required:true},
    {name:"content", label:"Content", type:"textarea", placeholder:"Enter Maps content",required:true},
    {name:"image", label:"Image URL", type:"file", placeholder:"https://example.com/image.jpg",required:false},
  ]

  const handleFormSubmit = async (values) => {
    try{
        const newMaps: TravelResource = await addResource(values);
        setMaps([...Maps, newMaps]);
        setFormOpen(false);
        toast.success('Maps added successfully');
    } catch (error) {
        console.error('Error adding Maps:', error);
        toast.error('Failed to add Maps');
        throw error;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchMaps(newPage, pagination.limit);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Travel Maps and Directions</h1>
          <p className="text-muted-foreground mt-1">
            Manage Maps and directions for travelers
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-travel-600 hover:bg-travel-700"
          onClick={handleAdd}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Maps
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
      ) : Maps.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold mb-2">No Maps found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first travel Maps
          </p>
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Maps
          </Button>
        </div>
      ) : isCardView ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Maps.map((map) => (
            <ListingCard
              key={map.id}
              id={map.id}
              title={map.title}
              description={map.description || map.content || ""}
              image={typeof map.image_url === "string" ? map.image_url : map.image_url ? URL.createObjectURL(map.image_url) : ""}
              badges={[ Number(map.published) === 1 ? 'Published' : 'Unpublished' ]}
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
                        <TableHead>Content</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Maps.map((map) => (
                        <TableRow key={map.id}>
                            <TableCell className="font-medium">{map.title}</TableCell>
                            <TableCell>{map.content.slice(0, 30)}...</TableCell>
                            <TableCell>{formatDate(map.created_at)}</TableCell>
                            <TableCell>{getStatusBadge(map.published)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEdit.bind(null, map.id)}
                                        className="bg-travel-100 text-travel-800 border-travel-200 hover:bg-travel-200"
                                    >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDelete.bind(null, map.id)}
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

      {/* Add Maps Dialog */}
      {!currentMaps && (
      <ListingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Add New Maps"
        fields={additionalFields}
        initialValues={{title:"",description:"",content:"",image_url:"",type:"map"}}
        onSubmit={handleFormSubmit}
      />
      )}
    
    {/* Pagination */}
        <Pagination className="mt-6">
            {Maps.length > 0 && (
            <div className="text-sm text-muted-foreground mb-2">
                Showing page {pagination.page} of {pagination.totalPages}
            </div>
            )}
            <PaginationContent>
            <PaginationPrevious
                onClick={pagination.page > 1 ? () => handlePageChange(pagination.page - 1) : undefined}
                className={pagination.page <= 1 ? "opacity-50 pointer-events-none" : ""}
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
                className={pagination.page >= pagination.totalPages ? "opacity-50 pointer-events-none" : ""}
            />
            </PaginationContent>
        </Pagination>
    
      {/* Edit Maps Dialog */}
      {currentMaps && (
        <ListingForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={`Update Maps: ${currentMaps.title}`}
          fields={additionalFields}
          initialValues={currentMaps}
          onSubmit={handleUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Maps"
        description={`Are you sure you want to delete the map? This action cannot be undone.`}
        isDeleting={isProcessing}
      />
    </>
  );
};

export default MapAndDirectionsPage;
