import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UploadManifest {
  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  stage: string;

  @IsOptional()
  @IsString()
  sha1: string;

  @IsOptional()
  @IsArray()
  fields: fieldsEntity[];

  @IsOptional()
  @IsArray()
  contents: contentsEntity[];

  @IsOptional()
  @IsString()
  updated_at: string;

  @IsOptional()
  @IsObject()
  links: linksEntity;
}

export class fieldsEntity {
  @IsString()
  id: string;
  @IsString()
  recipient: string;
  @IsBoolean()
  is_required: boolean;
  @IsString()
  type: string;
  @IsString()
  name: string;
  @IsString()
  options: string[];
  @IsString()
  description: string;
  @IsString()
  placeholder: string;
  @IsString()
  title: string;
  @IsString()
  value: string;
  @IsString()
  filled_at: string;
  @IsString()
  created_at: string;
  @IsString()
  updated_at: string;
  @IsArray()
  widgets: widgetsEntity[];
}

export class contentsEntity {
  id: string;
  type: string;
  value: string;
  page: number;
  x_axis: number;
  y_axis: number;
  width: number;
  height: number;
  rotation: number;
  line_height: number;
  text_color: string;
  opacity: number;
  font_size: number;
  font_family: string;
  created_at: string;
  updated_at: string;
}

export class widgetsEntity {
  @IsNumber()
  page: number;
  @IsNumber()
  x_axis: number;
  @IsNumber()
  y_axis: number;
  @IsNumber()
  width: number;
  @IsNumber()
  height: number;
  @IsNumber()
  rotation: number;
  @IsString()
  background_color: string;
  @IsString()
  border_color: string;
  @IsNumber()
  border_width: number;
  @IsString()
  text_color: string;
  @IsNumber()
  opacity: number;
  @IsNumber()
  font_size: number;
  @IsString()
  font_family: string;
}

export class linksEntity {
  self: string;
  download: string;
  display: string;
  preview: string;
  background_sheet: string;
}
