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

const ChecklistsPage = () => {
  const [Checklists, setChecklists] = useState<TravelResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  // State to toggle between card and list view
  const [isCardView, setIsCardView] = useState(true);
  const [currentChecklists, setCurrentChecklists] = useState<TravelResource | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [checklistsToDelete, setToolkitsToDelete] = useState<number | null>(null);
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
    fetchChecklists(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);


  const fetchChecklists = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      const data = await getTravelResources();
      const Checklists = data.filter((resource) => resource.type === "checklist");
      setChecklists(Checklists);
    } catch (error) {
      console.error('Error fetching Checklists:', error);
      toast.error('Failed to load Checklists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentChecklists(null);
    setFormOpen(true);
  };

  const handleEdit = (id: number) => {
    const checklist = Checklists.find((g) => g.id === id);
    if (checklist) {
      setCurrentChecklists(() => checklist);
      setFormOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setToolkitsToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdate = async (values) => {
    if (!currentChecklists) return;
    
    try {
      setIsProcessing(true);
      const response = await updateResource(currentChecklists.id, {
        ...values
      });

      setChecklists(Checklists.map(r => r.id === currentChecklists.id ? response : r));
      setFormOpen(false);
      toast.success('Checklists updated successfully');
    } catch (error) {
      console.error('Error updating Checklists:', error);
      toast.error('Failed to update Checklists');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!checklistsToDelete) return;

    try {
      setIsProcessing(true);
      await deleteResource(checklistsToDelete);
      setChecklists(Checklists.filter(r => r.id !== checklistsToDelete));
      toast.success('Checklists deleted successfully');
    } catch (error) {
      console.error('Error deleting Checklists:', error);
      toast.error('Failed to delete Checklists');
    } finally {
      setIsProcessing(false);
        setIsDeleteDialogOpen(false);
        setToolkitsToDelete(null);
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

const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchChecklists(newPage, pagination.limit);
  };
  const additionalFields = [
    {name:"title", label:"Title", type:"text", placeholder:"Enter Checklists title", required:true},
    {name:"published", label:"Published", type:"switch", placeholder:"Enter Checklists content",required:false},
    {name:"description", label:"Description", type:"textarea", placeholder:"Enter Checklists description",required:true},
    {name:"content", label:"Content", type:"textarea", placeholder:"Enter Checklists content",required:true},
    {name:"image", label:"Image URL", type:"file", placeholder:"https://example.com/image.jpg",required:false},
  ]

  const handleFormSubmit = async (values) => {
    try{
        const newToolkits: TravelResource = await addResource(values);
        setChecklists([...Checklists, newToolkits]);
        setFormOpen(false);
        toast.success('Checklists added successfully');
    } catch (error) {
        console.error('Error adding Checklists:', error);
        toast.error('Failed to add Checklists');
        throw error;
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Travel Checklists</h1>
          <p className="text-muted-foreground mt-1">
            Manage Checklists for travelers
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-travel-600 hover:bg-travel-700"
          onClick={handleAdd}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Checklists
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
      ) : Checklists.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold mb-2">No Checklists found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first travel Checklists
          </p>
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Checklists
          </Button>
        </div>
      ) : isCardView ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Checklists.map((checklist) => (
            <ListingCard
              key={checklist.id}
              id={checklist.id}
              title={checklist.title}
              description={checklist.description || checklist.content || ""}
              image={typeof checklist.image_url === "string" ? checklist.image_url : checklist.image_url ? URL.createObjectURL(checklist.image_url) : ""}
              badges={[ Number(checklist.published) === 1 ? 'Published' : 'Unpublished' ]}
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
                    {Checklists.map((checklist) => (
                        <TableRow key={checklist.id}>
                            <TableCell className="font-medium">{checklist.title}</TableCell>
                            <TableCell>{checklist.content.slice(0, 30)}...</TableCell>
                            <TableCell>{formatDate(checklist.created_at)}</TableCell>
                            <TableCell>{getStatusBadge(checklist.published)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEdit.bind(null, checklist.id)}
                                        className="bg-travel-100 text-travel-800 border-travel-200 hover:bg-travel-200"
                                    >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDelete.bind(null, checklist.id)}
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

      {/* Add Checklists Dialog */}
      {!currentChecklists && (
      <ListingForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title="Add New Checklists"
          fields={additionalFields}
          initialValues={{title:"",description:"",content:"",image_url:"",type:"checklist"}}
          onSubmit={handleFormSubmit}
        />
      )}
      {/* Edit Checklists Dialog */}
      {currentChecklists && (
        <ListingForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={`Update Checklists: ${currentChecklists.title}`}
          fields={additionalFields}
          initialValues={currentChecklists}
          onSubmit={handleUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Checklists"
        description={`Are you sure you want to delete the checklist? This action cannot be undone.`}
        isDeleting={isProcessing}
      />
    </>
  );
};

export default ChecklistsPage;
