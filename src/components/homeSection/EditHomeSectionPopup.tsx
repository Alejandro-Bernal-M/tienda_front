'use client'
import { HomeSection } from '../../lib/types';
import { updateHomeSection } from '@/lib/features/homeSection/homeSectionsSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useState } from 'react';

export default function EditHomeSectionPopup({homeSection}: {homeSection: HomeSection}){
  const [paragraphs, setParagraphs] = useState(homeSection.paragraphs);
  const [removeImage, setRemoveImage] = useState(false);
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.user);

  function handleRemoveParagraph(index: number){
    setParagraphs(prevParagraphs => {
      if(prevParagraphs){
        const updatedParagraphs = prevParagraphs.filter((_, i) => i !== index);
        return updatedParagraphs;
      }
    });
  }

  function handleAddParagraph(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
    event.preventDefault();
    setParagraphs(prevParagraphs => {
      if(prevParagraphs){
        return [...prevParagraphs, ''];
      }
    });
  }

  function handleParagraphChange(event: React.ChangeEvent<HTMLTextAreaElement>, index: number){
    event.preventDefault();
    setParagraphs(prevParagraphs => {
      if(prevParagraphs){
        const updatedParagraphs = prevParagraphs.map((paragraph, i) => {
          if(i === index){
            return event.target.value;
          }
          return paragraph;
        });
        return updatedParagraphs;
      }
    });
  }

  function handleImageRemoval(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
    event.preventDefault();
    setRemoveImage(prevState => !prevState);
  }

  function handleUpdateHomeSection(event: React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    let formData = new FormData(event.currentTarget);
    let newParagraphs = [];
    if (!paragraphs) {
      setParagraphs([]);
    }
    if(paragraphs) {
      for (let i = 1; i <= paragraphs.length; i++) {
        newParagraphs.push(formData.get(`paragraph${i}`));
        formData.delete(`paragraph${i}`);
      }
    }
    formData.append('paragraphs', JSON.stringify(newParagraphs));
    formData.append('_id', homeSection._id);
    if(removeImage){
      formData.delete('image');
      formData.append('removeImage', 'true');
    }
    
    dispatch(updateHomeSection({homeSection: formData, token}));
  }


  return (
    <form encType='multipart/form-data' onSubmit={handleUpdateHomeSection}>
      <label htmlFor='title'>Title</label>
      <input type='text' id='title' name='title' defaultValue={homeSection.title} />
      <label htmlFor='order'>Order</label>
      <input type='number' id='order' name='order' defaultValue={homeSection.order} />
      <label htmlFor='image'>Image</label>
      <input type='file' id='image' name='image' accept='image/*' />
      <button onClick={ handleImageRemoval} >
        {removeImage ? 'Undo remove image' : 'Remove image'}
      </button>

      {paragraphs && paragraphs.map((paragraph, index) => {
        return (
          <div key={index}>
            <label htmlFor={`paragraph${index + 1}`}>Paragraph {index + 1}</label>
            <textarea 
              id={`paragraph${index + 1}`} 
              name={`paragraph${index + 1}`} 
              value={paragraph}  // Use value instead of defaultValue
              onChange={(e) => handleParagraphChange(e, index)}  // Add onChange handler
            ></textarea>
            <button type='button' onClick={() => handleRemoveParagraph(index)}>Remove Paragraph</button>
          </div>
        )
      })}
      <button onClick={handleAddParagraph} >Add paragraph</button>
      <button>Update Home Section</button>
    </form>
  )
}